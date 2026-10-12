import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getActivityById, getRecommendation } from '../services/api';
import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      try {
        const activityResponse = await getActivityById(id);
        setActivity(activityResponse.data);

        try {
          const recResponse = await getRecommendation(id);
          setRecommendation(recResponse.data);
        } catch (recError) {
          console.error('Recommendation not available:', recError);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchActivityDetail();
  }, [id]);

  if (!activity) {
    return <Typography>Loading...</Typography>
  }
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Button variant="outlined" onClick={() => navigate('/activities')} sx={{ mb: 2 }}>
        ← Back to Activities
      </Button>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Activity Details</Typography>
          <Typography>Type: {activity.type}</Typography>
          <Typography>Duration: {activity.duration} minutes</Typography>
          <Typography>Calories Burned: {activity.caloriesBurned} kcal</Typography>
          {activity.createdAt && (
            <Typography>Date: {new Date(activity.createdAt).toLocaleString()}</Typography>
          )}
        </CardContent>
      </Card>

      {recommendation ? (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>AI Recommendation</Typography>
            <Typography variant="h6">Analysis</Typography>
            <Typography paragraph>{recommendation.recommendation}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6">Improvements</Typography>
            {recommendation?.improvements?.map((improvement, index) => (
              <Typography key={index} paragraph>• {improvement}</Typography>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6">Suggestions</Typography>
            {recommendation?.suggestions?.map((suggestion, index) => (
              <Typography key={index} paragraph>• {suggestion}</Typography>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6">Safety Guidelines</Typography>
            {recommendation?.safety?.map((safety, index) => (
              <Typography key={index} paragraph>• {safety}</Typography>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>AI Recommendation</Typography>
            <Typography color="text.secondary">
              Recommendation is currently generating or not available yet. Please refresh or check back in a few seconds.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default ActivityDetail