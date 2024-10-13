import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  SelectChangeEvent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface Session {
  title: string;
  file: File | null;
  category: string;
}

const Content: React.FC = () => {
  const [session, setSession] = useState<Session>({ title: '', file: null, category: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSession({ ...session, [name]: value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSession({ ...session, file: event.target.files[0] });
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSession({ ...session, category: event.target.value as string });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      console.log('Session to upload:', session);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <Card style={{ maxWidth: 400, margin: 'auto', marginTop: 20 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Upload Session
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Session Title"
            name="title"
            value={session.title}
            onChange={handleInputChange}
            fullWidth
          />
          <input
            accept="audio/*,video/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
              Choose File
            </Button>
          </label>
          {session.file && (
            <Typography variant="body2" color="textSecondary">
              {session.file.name}
            </Typography>
          )}
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={session.category}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="category1">Category 1</MenuItem>
              <MenuItem value="category2">Category 2</MenuItem>
              <MenuItem value="category3">Category 3</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUploading || !session.title || !session.file || !session.category}
            startIcon={isUploading ? <CircularProgress size={24} /> : null}
          >
            {isUploading ? 'Uploading...' : 'Upload Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Content;