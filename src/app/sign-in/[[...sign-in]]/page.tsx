import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 to-forensic-dark">
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* Branding Section */}
        <div className="w-full max-w-md px-6 py-12 md:py-24 text-center md:text-left text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">CaseVault Pro</h1>
            <p className="text-lg opacity-80">
              Digital Evidence Intelligence Platform - Securely manage cases, maintain chain of custody, and generate professional forensic reports.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM14 8a2 2 0 11-4 0 2 2 0 014 0zm2 2a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Client-side file processing for maximum security</p>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8c0 2.122.826 4.059 2.171 5.485l.034-.033a1 1 0 011.32-.083l.102.085A1 1 0 017 16h6a1 1 0 01.707 1.707l-.102.085a1 1 0 01-1.32-.083l.034-.033A7.983 7.983 0 0018 10a8 8 0 00-8-8z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Cryptographic hashing and file signature verification</p>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Professional forensic report generation</p>
            </div>
          </div>
        </div>
        
        {/* Sign In Container */}
        <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none",
                header: "text-center",
                headerTitle: "text-forensic text-2xl font-bold",
                headerSubtitle: "text-gray-500",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                formButtonPrimary: "bg-forensic hover:bg-forensic-dark focus:ring-forensic",
                footer: "hidden",
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
