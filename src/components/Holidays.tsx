import { Box, Chip, Tabs, Tab, IconButton, Tooltip, TextField } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { API, Counties, Endpoints } from '../constants';
import { useEffect, useState } from 'react';
import moment from 'moment';

import DateRows from './DateRows';
import '../styles/holidays.css';

export interface Payload {
   launchYear: string | number | undefined;
   countryCode: string;
   localName: string;
   counties: string[];
   global: boolean;
   fixed: boolean;
   type: 'Public';
   date: string;
   name: string;
}

export default () => {
   // Start with empty data & display a placeholder until data is fetched
   const [payload, setData] = useState([]);

   const [sortable, setSortable] = useState({
      counties: Object.keys(Counties),
      fixed: true,
      global: true
   });

   const [more, setMore] = useState<boolean>(false);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');
   const [tab, setTab] = useState(0);

   // Empty dependency array to only fetch the data when the component mounts to the virtual DOM
   useEffect(() => {
      try {
         // Fetch payload, then force react to update the component due to a state change
         fetch(API + Endpoints.HOLIDAYS).then(res => {
            if (!res.ok) {
               throw new Error(res.statusText);
            }

            return res.json();
         }).then(payload => setData(payload));
      } catch (e) {
         // @ts-ignore
         setError(e.message);
      }
   }, []);

   const data = parseHolidays(payload);

   if (error) {
      return <div className='we-failed'>
         We couldn't get the public holidays for you. {' '}
         Please report this error by contacting us.
         {error}
      </div>;
   }

   return <>
      <Box className='holidays-filtering' sx={{ borderBottom: 1, borderColor: 'divider' }}>
         <Tabs value={tab} onChange={(_, value) => setTab(value as unknown as number)} aria-label='Filtering'>
            <Tab label='All' id='all-tab' aria-controls='All Holidays' />
            <Tab label='Upcoming' id='upcoming-tab' aria-controls='Upcoming Holidays' />
            <Tab label='Passed' id='passed-tab' aria-controls='Passed Holidays' />
            <Tooltip title={more ? 'Hide Extra Filtering' : 'Show Extra Filtering'}>
               <IconButton
                  className='holidays-more-icon'
                  onClick={() => setMore(!more)}
               >
                  {more ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
               </IconButton>
            </Tooltip>
         </Tabs>
      </Box>
      {more && <SortOptions
         setSortable={setSortable}
         sortable={sortable}
      />}
      <div className='holiday-search-container'>
         <TextField
            label='Search'
            variant='standard'
            className='holiday-search'
            value={search}
            onChange={e => setSearch(e.target.value)}
         />
      </div>
      <DateRows
         data={data}
         tab={tab}
         sortable={sortable}
         search={search}
      />
   </>;
};

const SortOptions = ({ setSortable, sortable }) => {
   return <>
      <div className='holidays-extra-sorting'>
         <Chip
            label='Global'
            className='holiday-sort-breadcrumb'
            data-checked={sortable.global}
            onClick={() => setSortable({ ...sortable, global: !sortable.global })}
         />
         <Chip
            label='Fixed'
            className='holiday-sort-breadcrumb'
            data-checked={sortable.fixed}
            onClick={() => setSortable({ ...sortable, fixed: !sortable.fixed })}
         />
      </div>
      <div className='holidays-extra-sorting'>
         {Object.entries(Counties).map(([key, name]: [string, string], idx: number) =>
            <Chip
               key={idx}
               label={name}
               className='holiday-sort-breadcrumb'
               data-checked={sortable.counties.indexOf(key as never) > -1}
               onClick={() => {
                  const counties = sortable.counties;

                  const idx = counties.indexOf(key as never);
                  if (idx > -1) {
                     counties.splice(idx, 1);
                  } else {
                     counties.push(key as never);
                  }

                  setSortable({ ...sortable, counties });
               }}
            />
         )}
      </div>
   </>;
};

function parseHolidays(holidays: Payload[]) {
   const res: Record<any, any> = {};

   // Loop through each holiday and sort them into all into the categories of their respective month
   for (const holiday of holidays) {
      const date = moment(holiday.date);
      const month = date.format('MMMM');

      // De-duplicate items that have the same properties but are seperate with other counties
      const existing = res[month]?.find((e: Payload) =>
         e.date === holiday.date &&
         e.fixed === holiday.fixed &&
         e.global === holiday.global &&
         !e.counties.every(c => ~holiday.counties?.indexOf(c))
      );

      if (existing) {
         // De-duplicate counties & add county to existing holiday.
         existing.counties = [...new Set([...existing.counties, ...holiday.counties])];
         continue;
      }

      res[month] ??= [];
      res[month].push(holiday);
   }

   return res;
}