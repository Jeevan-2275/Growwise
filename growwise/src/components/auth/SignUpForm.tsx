'use client';

import { 
  Alert, 
  Button, 
  Stack, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Typography, 
  Box, 
  Divider, 
  CircularProgress,
  useTheme,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

const Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

export default function SignUpForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptTerms: false
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const onSubmit = async (data: z.infer<typeof Schema>) => {
    setError(null);
    try {
      const { acceptTerms, ...userData } = data;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (j?.error?.includes('exists')) {
          setError('An account with this email already exists');
        } else {
          setError(j?.error ?? 'Registration failed. Please try again.');
        }
        return;
      }
      
      await signIn('credentials', { 
        redirect: true, 
        email: data.email, 
        password: data.password, 
        callbackUrl: '/' 
      });
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            {error}
          </Alert>
        )}
        
        <TextField
          label="Full Name"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="John Doe"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <TextField
          label="Email"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="your.email@example.com"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <TextField
          label="Password"
          fullWidth
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <FormControlLabel
          control={
            <Checkbox 
              {...register('acceptTerms')} 
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Typography 
                component="span" 
                variant="body2" 
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms of Service
              </Typography>
              {' '}and{' '}
              <Typography 
                component="span" 
                variant="body2" 
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Typography>
            </Typography>
          }
          sx={{ mb: 1 }}
        />
        {errors.acceptTerms && (
          <Typography variant="caption" color="error">
            {errors.acceptTerms.message}
          </Typography>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={isSubmitting}
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            position: 'relative',
            mt: 1
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Account'
          )}
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            OR
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
        
        <Button 
          variant="outlined" 
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.grey[400],
              backgroundColor: theme.palette.grey[50]
            }
          }}
        >
          Sign up with Google
        </Button>
      </Stack>
    </form>
  );
}