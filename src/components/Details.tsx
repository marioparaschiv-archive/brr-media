import { List, ListItem, ListItemText, Chip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import type { Payload } from './Holidays';
import { Counties } from '../constants';

export default ({ payload }: { payload: Payload; }) => {
   return <List style={{ padding: 0 }} component='nav' aria-label='Holiday Details'>
      <ListItem divider>
         <ListItemText
            primary='Fixed'
            secondary='A holiday observed by all employees, except those necessary to provide emergency services, on a certain designated date.'
            className='holiday-info-text'
         />
         {payload.fixed ? <Check color='success' /> : <Close color='error' />}
      </ListItem>
      <ListItem divider={Boolean(payload.counties?.length) || Boolean(payload.launchYear)}>
         <ListItemText
            primary='Global'
            secondary='A holiday which applies to the whole of the UK and not to a specific part of the UK.'
            className='holiday-info-text'
         />
         {payload.global ? <Check color='success' /> : <Close color='error' />}
      </ListItem>
      {payload.launchYear && <ListItem divider={Boolean(payload.counties?.length)}>
         <ListItemText
            primary='Launch Year'
            secondary='The year this holiday was put in place.'
            className='holiday-info-text'
         />
         {String(payload.launchYear)}
      </ListItem>}
      {payload.counties?.length && <ListItem>
         <ListItemText
            primary='Counties'
            secondary='A list of specific parts of the UK that this holiday applies to.'
            className='holiday-info-text'
         />
         <div className='holiday-counties'>
            {payload.counties?.map((county: string, idx: number) => <div key={idx}>
               <Chip label={(Counties as any)[county]} />
            </div>)}
         </div>
      </ListItem>}
   </List>;
};