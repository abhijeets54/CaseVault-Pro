// CaseVault Pro - Chain of Custody Service
// Handles all COC operations with cryptographic signatures

import { supabase } from '../supabase/client';
import {
  COCEvent,
  COCEventRow,
  ActivityType,
  IntegrityResult,
  COCCertificate,
  RecordCOCInput,
  cocEventToCamelCase,
} from '../types';

/**
 * Chain of Custody Service
 * Provides blockchain-style immutable audit trail for evidence
 */
export class ChainOfCustodyService {
  /**
   * Record a new chain of custody event
   */
  static async recordEvent(input: RecordCOCInput & {
    userId: string;
    userEmail: string;
    userFullName: string;
  }): Promise<COCEvent | null> {
    try {
      // Get client IP address
      const ipAddress = await this.getClientIP();

      // Get user agent
      const userAgent = navigator.userAgent;

      // Fetch the last signature for this file
      const previousSignature = await this.getLastSignature(
        input.caseId,
        input.fileHash
      );

      // Generate digital signature
      const digitalSignature = await this.generateSignature({
        caseId: input.caseId,
        fileName: input.fileName,
        fileHash: input.fileHash,
        activityType: input.activityType,
        userId: input.userId,
        timestamp: new Date().toISOString(),
        previousSignature,
        metadata: input.metadata || {},
      });

      // Insert into database
      const { data, error } = await supabase
        .from('chain_of_custody')
        .insert({
          case_id: input.caseId,
          file_name: input.fileName,
          file_hash: input.fileHash,
          activity_type: input.activityType,
          user_id: input.userId,
          user_email: input.userEmail,
          user_full_name: input.userFullName,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: input.metadata || {},
          digital_signature: digitalSignature,
          previous_signature: previousSignature,
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording COC event:', error);
        return null;
      }

      return cocEventToCamelCase(data as COCEventRow);
    } catch (error) {
      console.error('Error in recordEvent:', error);
      return null;
    }
  }

  /**
   * Get the last signature for a file in the chain
   */
  static async getLastSignature(
    caseId: string,
    fileHash: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('chain_of_custody')
      .select('digital_signature')
      .eq('case_id', caseId)
      .eq('file_hash', fileHash)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.digital_signature;
  }

  /**
   * Get full chain of custody for a file
   */
  static async getFileChain(
    caseId: string,
    fileHash: string
  ): Promise<COCEvent[]> {
    const { data, error } = await supabase
      .from('chain_of_custody')
      .select('*')
      .eq('case_id', caseId)
      .eq('file_hash', fileHash)
      .order('timestamp', { ascending: true });

    if (error || !data) {
      console.error('Error fetching file chain:', error);
      return [];
    }

    return data.map((row) => cocEventToCamelCase(row as COCEventRow));
  }

  /**
   * Get all chain of custody events for a case
   */
  static async getCaseChain(caseId: string): Promise<COCEvent[]> {
    const { data, error } = await supabase
      .from('chain_of_custody')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp', { ascending: true });

    if (error || !data) {
      console.error('Error fetching case chain:', error);
      return [];
    }

    return data.map((row) => cocEventToCamelCase(row as COCEventRow));
  }

  /**
   * Verify chain integrity for a file
   */
  static async verifyChainIntegrity(
    caseId: string,
    fileHash: string
  ): Promise<IntegrityResult> {
    const chain = await this.getFileChain(caseId, fileHash);
    const errors: string[] = [];

    if (chain.length === 0) {
      return {
        isValid: true,
        errors: [],
        totalEvents: 0,
        verifiedAt: new Date().toISOString(),
      };
    }

    // Verify first event has no previous signature
    if (chain[0].previousSignature !== null) {
      errors.push('First event in chain has a previous signature');
    }

    // Verify each subsequent event links to previous
    for (let i = 1; i < chain.length; i++) {
      const current = chain[i];
      const previous = chain[i - 1];

      if (current.previousSignature !== previous.digitalSignature) {
        errors.push(
          `Event ${i + 1} (${current.activityType}) does not link to previous event`
        );
      }

      // Verify signature by regenerating it
      const expectedSignature = await this.generateSignature({
        caseId: current.caseId,
        fileName: current.fileName,
        fileHash: current.fileHash,
        activityType: current.activityType,
        userId: current.userId,
        timestamp: current.timestamp,
        previousSignature: current.previousSignature,
        metadata: current.metadata,
      });

      if (expectedSignature !== current.digitalSignature) {
        errors.push(
          `Event ${i + 1} (${current.activityType}) has invalid signature`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalEvents: chain.length,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a certificate for chain of custody
   */
  static async generateCertificate(
    caseId: string,
    fileHash: string,
    caseNumber: string,
    fileName: string
  ): Promise<COCCertificate> {
    const chain = await this.getFileChain(caseId, fileHash);
    const integrity = await this.verifyChainIntegrity(caseId, fileHash);

    // Get current user for certificate
    const { data: { user } } = await supabase.auth.getUser();

    return {
      fileHash,
      fileName,
      caseNumber,
      chain,
      integrity,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.email || 'Unknown',
    };
  }

  /**
   * Generate digital signature using SHA-256
   */
  private static async generateSignature(data: {
    caseId: string;
    fileName: string;
    fileHash: string;
    activityType: ActivityType;
    userId: string;
    timestamp: string;
    previousSignature: string | null;
    metadata: Record<string, any>;
  }): Promise<string> {
    // Create a canonical string representation
    const canonicalString = [
      data.caseId,
      data.fileName,
      data.fileHash,
      data.activityType,
      data.userId,
      data.timestamp,
      data.previousSignature || '',
      JSON.stringify(data.metadata),
    ].join('|');

    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  }

  /**
   * Get client IP address
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Export chain to JSON
   */
  static exportChainToJSON(chain: COCEvent[]): string {
    return JSON.stringify(chain, null, 2);
  }

  /**
   * Get activity statistics for a case
   */
  static async getCaseActivityStats(caseId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<ActivityType, number>;
    uniqueFiles: number;
    uniqueUsers: number;
  }> {
    const chain = await this.getCaseChain(caseId);

    const eventsByType: Record<string, number> = {};
    const uniqueFiles = new Set<string>();
    const uniqueUsers = new Set<string>();

    chain.forEach((event) => {
      eventsByType[event.activityType] =
        (eventsByType[event.activityType] || 0) + 1;
      uniqueFiles.add(event.fileHash);
      uniqueUsers.add(event.userId);
    });

    return {
      totalEvents: chain.length,
      eventsByType: eventsByType as Record<ActivityType, number>,
      uniqueFiles: uniqueFiles.size,
      uniqueUsers: uniqueUsers.size,
    };
  }
}

export default ChainOfCustodyService;
