import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Button, TextField } from '@mui/material';

interface Category {
  id: number;
  name: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    // Fetch categories from your API here
    // For now, we'll use dummy data
    const dummyCategories: Category[] = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
    ];
    setCategories(dummyCategories);
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCategoryObj: Category = {
        id: categories.length + 1,
        name: newCategory.trim(),
      };
      setCategories([...categories, newCategoryObj]);
      setNewCategory('');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Categories</Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category.id}>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
      <TextField
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        label="New Category"
        variant="outlined"
      />
      <Button onClick={handleAddCategory} variant="contained" color="primary">
        Add Category
      </Button>
    </div>
  );
};

export default Categories;
