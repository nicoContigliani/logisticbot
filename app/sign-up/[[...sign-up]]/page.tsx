'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Elegant Radial Light Background */}
      <div
        className="animate-pulse-slow"
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="animate-float"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="animate-float-reverse"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px 32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Glowing accent line */}
          <div
            className="animate-scale-x"
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #667eea, #764ba2, transparent)',
              borderRadius: '2px',
            }}
          />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              className="animate-fade-in"
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '8px',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Create Account
            </h1>
            <p
              className="animate-fade-in-delay"
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}
            >
              Start your learning journey today
            </p>
          </div>

          {/* Clerk SignUp */}
          <div className="animate-fade-in-delay-2">
            <SignUp 
              routing="hash"
              signInUrl="/sign-in"
              redirectUrl="/dashboard/onboarding"
              appearance={{
                layout: {
                  logoPlacement: 'none',
                  socialButtonsPlacement: 'bottom',
                },
                variables: {
                  colorPrimary: '#667eea',
                  colorBackground: 'transparent',
                  colorText: '#fff',
                  colorInputBackground: 'rgba(255,255,255,0.05)',
                  colorInputText: '#fff',
                  borderRadius: '12px',
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                },
                elements: {
                  rootBox: {
                    width: '100%',
                  },
                  card: {
                    width: '100%',
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                  },
                  form: {
                    width: '100%',
                  },
                  formField: {
                    width: '100%',
                  },
                  formFieldInput: {
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  },
                  formFieldInputFocus: {
                    borderColor: '#667eea',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
                  },
                  formFieldLabel: {
                    fontSize: '13px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                  },
                  formButtonPrimary: {
                    width: '100%',
                    backgroundColor: '#667eea',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, transform 0.1s',
                  },
                  formButtonPrimaryHover: {
                    backgroundColor: '#5a6fd6',
                  },
                  formButtonPrimaryActive: {
                    transform: 'scale(0.98)',
                  },
                  dividerLine: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  dividerText: {
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                  },
                  socialButtonsBlockButton: {
                    width: '100%',
                    padding: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  },
                  socialButtonsBlockButtonHover: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  footer: {
                    display: 'none',
                  },
                  footerActionLink: {
                    color: '#667eea',
                  },
                  formFieldInputShowPasswordButton: {
                    color: 'rgba(255,255,255,0.5)',
                  },
                },
              }}
            />
          </div>

          {/* Sign In Link */}
          <div
            className="animate-fade-in-delay-3"
            style={{ textAlign: 'center', marginTop: '24px' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              {"Already have an account? "}
              <Link
                href="/sign-in"
                style={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
