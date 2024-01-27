import type { Payload } from './Holidays';

import { Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import { ExpandMore, SearchOff } from '@mui/icons-material';
import moment from 'moment';

import Details from './Details';

interface DateRowsProps {
   data: Record<string, Payload[]>;
   sortable: Record<string, any>;
   search: string;
   tab: number;
}

export default ({ data, tab, sortable, search }: DateRowsProps) => {
   const rendered = Object.entries(data).map(([month, collection]: [string, Payload[]], idx: number) => {
      // Filter data depending on which tab is selected
      const data = parsePayload(collection, tab, sortable, search);

      if (!data.length) return null;

      return <div key={idx}>
         <Typography fontWeight='bold' fontSize={20} margin='10px 0'>
            {month}
         </Typography>
         <div className='holiday-collection'>
            {/* Use React's keys to avoid race condition bugs in the renderer */}
            {data.map((payload: Payload, idx: number) =>
               <Accordion key={idx}>
                  <AccordionSummary
                     expandIcon={<ExpandMore className='holiday-expand-icon' />}
                     className='holiday-summary'
                  >
                     <Chip className='holiday-type' label={payload.type} />
                     {/* Show the holiday name & show the local name in braces if
                        it exists and format the date to "Day Ordinal Month" */}
                     <Typography>
                        {moment(payload.date).format('Do MMMM')} - {payload.name} {payload.localName !== payload.name && `(${payload.localName})`}
                     </Typography>
                  </AccordionSummary>
                  <AccordionDetails style={{ padding: 0 }}>
                     <Divider />
                     <Details payload={payload} />
                  </AccordionDetails>
               </Accordion>
            )}
         </div>
      </div>;
   }).filter(Boolean);

   // If filtering returns nothing, inform the client.
   return <>
      {rendered.length ? rendered : <div className='holidays-not-found'>
         <SearchOff className='holidays-not-found-icon' />
         We couldn't find any holidays that match that criteria.
      </div>}
   </>;
};

function parsePayload(data: Payload[], tab: number, sortable: Record<string, any>, search: string) {
   // First filter depending on the selected tab
   return data.filter((payload: Payload) => {
      switch (tab) {
         // "All" Tab
         case 0:
            return true;
         // "Upcoming" Tab
         case 1:
            if (moment(payload.date) > moment()) return true;
            break;
         // "Passed" Tab
         case 2:
            if (moment(payload.date) < moment()) return true;
            break;
      }

      return false;
   }).filter((payload: Payload) => { /* Filter by global, fixed and counties */
      for (const sort in sortable) {
         const value = sortable[sort];

         switch (sort) {
            case 'counties':
               if (payload.counties?.some(c => value.includes(c))) {
                  return true;
               }
               break;
            case 'global':
               if (payload.global && value) return true;
               break;
            case 'fixed':
               if (payload.fixed && value) return true;
               break;
         }
      }

      return false;
   }).filter((payload: Payload) => { /* Filter by search on what remains */
      if (!search) {
         return true;
      }

      // If the name or local name of the holiday include the search, display it.

      // Using ~.indexOf() is faster than .includes() by up to 100x in the V8 engine.
      // This is currently a reported bug in Chromium which has been fixed in later beta versions.
      const lookup = search.toLowerCase();
      if (~payload.name.toLowerCase().indexOf(lookup) || ~payload.localName.toLowerCase().indexOf(lookup)) {
         return true;
      }

      return false;
   });
}