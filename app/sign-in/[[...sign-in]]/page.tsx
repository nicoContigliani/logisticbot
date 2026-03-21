'use client';

import React, { useState, useCallback } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { pageVariants, staggerContainer, scaleInVariants, springConfig } from '@/hooks/useAnimations';

const validate = (values: { email: string; password: string }) => {
  const errors: Record<string, string> = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [generalError, setGeneralError] = useState('');
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
  } = useForm({
    initialValues: { email: '', password: '' },
    validate,
    onSubmit: async (formValues) => {
      if (!signIn) {
        throw new Error('Authentication not loaded');
      }
      
      const result = await signIn.create({
        identifier: formValues.email,
        password: formValues.password,
      });

      if (result.status === 'complete') {
        router.push('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    },
  });

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    try {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
      
      if (!signIn) {
        throw new Error('Authentication not loaded');
      }
      
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (result.status === 'complete') {
        router.push('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setGeneralError(message);
    }
  }, [values, signIn, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(100px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated Accent Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transformOrigin: 'left',
              }}
            />

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue your learning journey
                </Typography>
              </motion.div>
            </Box>

            <form onSubmit={onSubmit}>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <motion.div variants={scaleInVariants}>
                    <Input
                      label="Email"
                      type="email"
                      value={values.email}
                      onChange={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={touched.email ? errors.email : undefined}
                      placeholder="Enter your email"
                      required
                      fullWidth
                    />
                  </motion.div>

                  <motion.div variants={scaleInVariants}>
                    <Input
                      label="Password"
                      type="password"
                      value={values.password}
                      onChange={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password ? errors.password : undefined}
                      placeholder="Enter your password"
                      required
                      fullWidth
                      isPassword
                    />
                  </motion.div>

                  <AnimatePresence>
                    {generalError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          {generalError}
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={scaleInVariants}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </motion.div>

            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {"Don't have an account? "}
                  <Link
                    href="/sign-up"
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
