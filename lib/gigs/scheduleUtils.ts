// Mocking schedule utils for now
export const groupSchedules = (schedules: any[]) => { 
    return schedules.map(s => ({ days: [s.day], hours: s.hours })); 
};
