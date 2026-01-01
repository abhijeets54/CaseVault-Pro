import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 to-forensic-dark">
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* Branding Section */}
        <div className="w-full max-w-md px-6 py-12 md:py-24 text-center md:text-left text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">CaseVault Pro</h1>
            <p className="text-lg opacity-80">
              Join our platform to access enterprise-grade digital evidence management and forensic intelligence tools.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-3.8 0-7.387-.85-10-2.364z" />
                </svg>
              </div>
              <p>Zero file uploads - everything stays on your machine</p>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Secure authentication and user management</p>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Build case files and generate professional reports</p>
            </div>
          </div>
        </div>
        
        {/* Sign Up Container */}
        <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full">
          <SignUp
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
