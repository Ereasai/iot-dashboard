import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  Chip,
  Box,
  Backdrop,
  CircularProgress,
  Grow,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const Page1 = ({ selectedTags, setSelectedTags, setSelectedValueName }) => {

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`http://${BACKEND_URL}/get-value-tags`);
        let data = await response.json();
        const tagsOnly = data.map(({ name, value_ids }) => name);
        setTags(tagsOnly.sort());
        setLoading(false);
      } catch {
        setError('Failed to fetch tags');
      }

    };
    loadData();
    }, []);

  return (
    <DialogContent>
      <Typography variant='h5'>Select a tag.</Typography>
      {error && <Alert 
        severity='error'
        sx={{
          mt: 2
        }}
      >
        {error}
      </Alert>}
      {loading && !error && <CircularProgress />}
      <br />
      {!loading && tags.map(tag => (
        <Chip
          key={tag}
          label={tag}
          onClick={() => {
            setSelectedTags([tag]);
            setSelectedValueName('');
          }}
          color={(selectedTags[0] === tag) ? 'primary' : 'default'}
          sx={{ margin: 0.5 }}
        />
      ))}
    </DialogContent>
  );
};

export default Page1;