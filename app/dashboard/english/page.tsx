'use client';

import { useState, useEffect, memo } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Flex container component
const FlexBox = memo(function FlexBox({ children, sx, ...props }: any) {
  return (
    <Box sx={{ display: 'flex', ...sx }} {...props}>
      {children}
    </Box>
  );
});

// Grid-like container using flexbox
const GridContainer = memo(function GridContainer({ children, spacing = 2, sx }: any) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: spacing,
        ...sx
      }}
    >
      {children}
    </Box>
  );
});

// Components
const StatCard = memo(function StatCard({ icon, label, value, trend, color = 'primary' }: any) {
  return (
    <motion.div variants={fadeIn}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}
      >
        <FlexBox gap={2} alignItems="center">
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
          </Box>
          {trend && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </FlexBox>
      </Paper>
    </motion.div>
  );
});

const ProgressRing = memo(function ProgressRing({ value, label, size = 80 }: any) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <CircularProgress
        variant="determinate"
        value={value * 10}
        size={size}
        thickness={4}
        sx={{ color: 'primary.main' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {Math.round(value)}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
});

const VocabularyCard = memo(function VocabularyCard({ word, meaning, mastered }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: mastered ? 'success.light' : 'background.default',
          border: '1px solid',
          borderColor: mastered ? 'success.main' : 'divider',
          transition: 'all 0.2s'
        }}
      >
        <FlexBox justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {word}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {meaning}
            </Typography>
          </Box>
          {mastered && <CheckCircleIcon color="success" />}
        </FlexBox>
      </Paper>
    </motion.div>
  );
});

const SessionCard = memo(function SessionCard({ topic, date, performance }: any) {
  return (
    <motion.div variants={fadeIn} whileHover={{ x: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <FlexBox justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {topic}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(date).toLocaleDateString()}
            </Typography>
          </Box>
          <FlexBox gap={1} flexWrap="wrap">
            {(['fluency', 'grammar', 'comprehension'] as const).map((metric) => (
              <Chip
                key={metric}
                size="small"
                label={`${performance[metric]}/10`}
                color={performance[metric] >= 7 ? 'success' : performance[metric] >= 5 ? 'warning' : 'error'}
                variant="outlined"
              />
            ))}
          </FlexBox>
        </FlexBox>
      </Paper>
    </motion.div>
  );
});

const AddSessionForm = memo(function AddSessionForm({ onClose, onSubmit }: any) {
  const [transcript, setTranscript] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!transcript || !topic) return;
    setLoading(true);
    await onSubmit({ transcript, topic });
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mt: 2, border: '1px solid', borderColor: 'primary.main' }}>
        <FlexBox justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Nueva Clase</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </FlexBox>
        
        <TextField
          fullWidth
          label="Tema de la clase"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Ej: Reparos del hogar"
        />
        
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Transcripción"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Pega aquí la transcripción de tu clase..."
          sx={{ mb: 2 }}
        />
        
        <FlexBox gap={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!transcript || !topic || loading}
            startIcon={<UploadFileIcon />}
          >
            {loading ? 'Procesando...' : 'Procesar Clase'}
          </Button>
        </FlexBox>
      </Paper>
    </motion.div>
  );
});

// Main Dashboard
function EnglishLearningDashboard() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);

  // Mock data for demo
  useEffect(() => {
    if (isLoaded) {
      // Simulate API call
      setTimeout(() => {
        setStudentData({
          name: user?.fullName || 'Estudiante',
          currentLevel: 'A2-B1',
          focusAreas: ['Full Stack Dev', 'Data Science'],
          stats: { totalClasses: 12, vocabularyCount: 150 },
          pendingTopics: ['Passive Voice', 'Prepositions'],
          masteredTopics: ['Basic Greetings', 'Simple Past']
        });
        
        setSessions([
          { id: 1, topic: 'Reparos del hogar', date: '2026-03-21', performance: { fluency: 7, grammar: 5, comprehension: 9 } },
          { id: 2, topic: 'Entrevista laboral', date: '2026-03-18', performance: { fluency: 8, grammar: 6, comprehension: 8 } },
          { id: 3, topic: 'Reunión de equipo', date: '2026-03-15', performance: { fluency: 6, grammar: 4, comprehension: 7 } },
        ]);
        
        setWeeklySummary({
          message: 'Esta semana mejoraste un 10% en comprensión general! 🎉',
          stats: {
            classesCount: 2,
            performance: { fluency: 7.5, grammar: 5.5, comprehension: 8.5 },
            newWords: 15,
            grammarFixes: 8,
            improvement: 10
          }
        });
        
        setLoading(false);
      }, 1000);
    }
  }, [isLoaded, user]);

  const handleAddSession = async (data: any) => {
    // Here you would call the API to process the transcript
    console.log('Adding session:', data);
  };

  if (!isLoaded || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <GridContainer spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
          ))}
        </GridContainer>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <FlexBox justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Hola, {studentData?.name || 'Estudiante'} 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Nivel actual: {studentData?.currentLevel} • {studentData?.stats.totalClasses} clases tomadas
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setShowAddForm(!showAddForm)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Nueva Clase
              </Button>
            </FlexBox>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {/* Weekly Summary Card */}
          <AnimatePresence>
            {weeklySummary && (
              <motion.div variants={fadeIn}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: weeklySummary.stats?.improvement > 0 ? 'success.main' : 'warning.main',
                    bgcolor: weeklySummary.stats?.improvement > 0 ? 'success.light' : 'warning.light'
                  }}
                >
                  <FlexBox alignItems="center" gap={2}>
                    <Box
                      sx={{
                        bgcolor: 'white',
                        color: 'success.main',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <WhatshotIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {weeklySummary.message}
                      </Typography>
                      {weeklySummary.stats && (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {weeklySummary.stats.classesCount} clases • {weeklySummary.stats.newWords} palabras nuevas
                        </Typography>
                      )}
                    </Box>
                  </FlexBox>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Session Form */}
          <AnimatePresence>
            {showAddForm && (
              <AddSessionForm
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddSession}
              />
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <GridContainer spacing={3} sx={{ mb: 4 }}>
            <StatCard
              icon={<SchoolIcon />}
              label="Clases Totales"
              value={studentData?.stats.totalClasses || 0}
              color="primary"
            />
            <StatCard
              icon={<AutoStoriesIcon />}
              label="Vocabulario"
              value={studentData?.stats.vocabularyCount || 0}
              color="info"
            />
            <StatCard
              icon={<CheckCircleIcon />}
              label="Temas Dominados"
              value={studentData?.masteredTopics?.length || 0}
              color="success"
            />
            <StatCard
              icon={<TimelineIcon />}
              label="Nivel"
              value={studentData?.currentLevel || 'A1'}
              color="warning"
            />
          </GridContainer>

          {/* Performance Rings */}
          <GridContainer spacing={3} sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Rendimiento</Typography>
              <FlexBox justifyContent="center" gap={3} mt={2} flexWrap="wrap">
                <ProgressRing value={weeklySummary?.stats?.performance?.fluency || 0} label="Fluidez" />
                <ProgressRing value={weeklySummary?.stats?.performance?.grammar || 0} label="Gramática" />
                <ProgressRing value={weeklySummary?.stats?.performance?.comprehension || 0} label="Comprensión" />
              </FlexBox>
            </Paper>

            {/* Pending Topics */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Temas Pendientes</Typography>
              <FlexBox gap={1} mt={2} flexWrap="wrap">
                {studentData?.pendingTopics?.map((topic: string, i: number) => (
                  <Chip key={i} label={topic} color="warning" variant="outlined" />
                ))}
                {(!studentData?.pendingTopics || studentData.pendingTopics.length === 0) && (
                  <Typography color="text.secondary">¡Excelente! No hay temas pendientes</Typography>
                )}
              </FlexBox>
            </Paper>

            {/* Focus Areas */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Áreas de Enfoque</Typography>
              <FlexBox gap={1} mt={2} flexWrap="wrap">
                {studentData?.focusAreas?.map((area: string, i: number) => (
                  <Chip key={i} label={area} color="primary" />
                ))}
              </FlexBox>
            </Paper>
          </GridContainer>

          {/* Recent Sessions */}
          <Typography variant="h6" sx={{ mb: 2 }}>Clases Recientes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sessions.map((session: any) => (
              <SessionCard key={session.id} {...session} />
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default memo(EnglishLearningDashboard);
