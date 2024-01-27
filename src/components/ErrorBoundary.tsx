import { Typography } from '@mui/material';
import React from 'react';

// Sadly, ErrorBoundaries are only possible in class components due to there being no
// hook available like componentDidCatch

export default class ErrorBoundary extends React.Component<React.PropsWithChildren> {
   state = { error: null };

   render() {
      if (this.state.error) {
         return <Typography>
            This component failed to render.
            Please contact us and let our team know of this issue.
         </Typography>;
      }

      // First render. If this render fails, react will call componentDidCatch which will set our state
      // to the error, making the if statement above evaluate to be truthy
      return this.props.children;
   }

   componentDidCatch() {
      // React will throw the error for us.
      this.setState({ error: true });
   }
}