import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  styled,
  Stack,
  Pagination
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { LogEntry, LogStats, LogType } from '../types/logs';
import { getApiUrl } from '../utils/apiConfig';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const LogLevelChip = styled(Chip)(({ theme }) => ({
  '&.MuiChip-root': {
    color: theme.palette.common.white,
    fontWeight: 500,
    fontSize: '0.75rem',
  },
}));

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logType, setLogType] = useState<LogType>('error');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [level, setLevel] = useState<string>('');
  const [source, setSource] = useState<'app' | 'pm2'>('pm2');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        type: logType,
        page: page.toString(),
        limit: limit.toString(),
        source: source,
      });

      if (level) {
        params.append('level', level);
      }

      const response = await fetch(getApiUrl(`/v1/logs?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.data.logs);
      setTotalLogs(data.data.total);
      setTotalPages(Math.ceil(data.data.total / data.data.limit));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }, [logType, page, limit, level, source]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        source: source,
      });

      const response = await fetch(getApiUrl(`/v1/logs/stats?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch log statistics');
      }

      const data = await response.json();
      setStats(data.data[logType]);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [logType, source]);

  const generateTestLog = async () => {
    try {
      setTestLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('/v1/logs/test'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to generate test log');
      }

      // Wait a moment for the log to be written, then refresh
      setTimeout(() => {
        fetchLogs();
        fetchStats();
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate test log');
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
    setLoading(false);
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs();
        fetchStats();
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchLogs, fetchStats]);

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <ErrorIcon color="error" />;
      case 'WARN':
        return <WarningIcon color="warning" />;
      case 'INFO':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'error';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
          Server Logs
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Monitor and analyze server logs in real-time
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: '600px', 
            margin: '24px auto',
            borderRadius: '12px',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Current logs are from July 25th. If logs appear empty, try:
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Switch to "PM2 Logs" source for system logs</li>
            <li>Try different log types (error, out, combined)</li>
            <li>Check higher page numbers for older logs</li>
            <li>Use "App Logs" source for application-specific logs</li>
            <li>Click "Test Log" to generate new test entries</li>
          </ul>
        </Typography>
      </Alert>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Log Type</InputLabel>
              <Select
                value={logType}
                label="Log Type"
                onChange={(e) => setLogType(e.target.value as LogType)}
              >
                <MenuItem value="error">Error Logs</MenuItem>
                <MenuItem value="out">Output Logs</MenuItem>
                <MenuItem value="combined">Combined Logs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Page"
              type="number"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              inputProps={{ min: 1, max: 200 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={source}
                label="Source"
                onChange={(e) => setSource(e.target.value as 'app' | 'pm2')}
              >
                <MenuItem value="pm2">PM2 Logs</MenuItem>
                <MenuItem value="app">App Logs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Level (optional)"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="ERROR, WARN, INFO"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchLogs();
                fetchStats();
              }}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="outlined"
              startIcon={testLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
              onClick={generateTestLog}
              disabled={testLoading}
              fullWidth
            >
              Test Log
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  File Status
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {stats.exists ? 'Available' : 'Not Found'}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  File Size
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {stats.size ? formatFileSize(stats.size) : 'N/A'}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Lines
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {stats.lines ? stats.lines.toLocaleString() : 'N/A'}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Modified
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {stats.lastModified ? new Date(stats.lastModified).toLocaleString() : 'N/A'}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {/* Logs Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getLevelIcon(log.level)}
                      <LogLevelChip
                        label={log.level}
                        size="small"
                        color={getLevelColor(log.level)}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatTimestamp(log.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {log.message}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {logs.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No logs found for the selected criteria
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Log count info */}
      {totalLogs > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs.toLocaleString()} logs
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Logs; 