import { Card, CardContent, Grid2, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { getActivities } from '../services/api';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);
  if (activities.length === 0) {
    return <Typography sx={{ mt: 2 }} color="text.secondary">No activities logged yet. Track your first activity above!</Typography>;
  }

  return (
    <Grid2 container spacing={2}>
      {activities.map((activity) => (
        <Grid2 key={activity.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card 
            sx={{ cursor: 'pointer', height: '100%', '&:hover': { boxShadow: 4 } }}
            onClick={() => navigate(`/activities/${activity.id}`)}
          >
            <CardContent>
              <Typography variant='h6'>{activity.type}</Typography>
              <Typography>Duration: {activity.duration} mins</Typography>
              <Typography>Calories: {activity.caloriesBurned} kcal</Typography>
              {activity.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  )
}

export default ActivityList