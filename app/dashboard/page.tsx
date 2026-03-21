'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const stats = [
  { label: 'Courses Enrolled', value: '12', icon: <SchoolIcon />, color: '#6366f1' },
  { label: 'Hours Learned', value: '48', icon: <PlayCircleIcon />, color: '#ec4899' },
  { label: 'Certificates', value: '5', icon: <EmojiEventsIcon />, color: '#f59e0b' },
  { label: 'Progress', value: '72%', icon: <TrendingUpIcon />, color: '#10b981' },
];

const recentCourses = [
  { title: 'Introduction to React', progress: 80, thumbnail: 'https://picsum.photos/seed/react/300/200' },
  { title: 'Advanced TypeScript', progress: 60, thumbnail: 'https://picsum.photos/seed/ts/300/200' },
  { title: 'Next.js Fundamentals', progress: 45, thumbnail: 'https://picsum.photos/seed/next/300/200' },
];

export default function DashboardPage() {
  const { userId } = useAuth();
  const { user } = useUser();

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.firstName || 'Student'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue your learning journey and track your progress
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${stat.color}20`,
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Recent Courses */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Continue Learning
        </Typography>
        <Grid container spacing={3}>
          {recentCourses.map((course, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={course.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <Card sx={{ cursor: 'pointer' }}>
                  <Box
                    sx={{
                      height: 160,
                      backgroundImage: `url(${course.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '16px 16px 0 0',
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          flexGrow: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${course.progress}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="600" color="primary">
                        {course.progress}%
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
}
