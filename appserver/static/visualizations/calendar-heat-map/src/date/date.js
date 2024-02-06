const daysInMonth = (month, year) => {
    if (month < 1 || month > 12) throw new Error("Invalid month");
    if (year <= 0) throw new Error("Invalid year");
    return new Date(year, month, 0).getDate();
};

/**
 * 
 * @param {number} month the month number (1-12)
 * @param {number} year the year
 * @return an array of number, each number represent the number of the week in the month depending on the month and the year
 */
const getWeeksNb = (month, year) => {
    if (month < 1 || month > 12) throw new Error("Invalid month");
    if (year <= 0) throw new Error("Invalid year");

    const weeksNb = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0); // Last day of the month

    // Start with the first week of the month
    let currentWeek = getWeekNumber(firstDayOfMonth);
    weeksNb.push(currentWeek);

    for (let day = 2; day <= lastDayOfMonth.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const weekNumber = getWeekNumber(date);
        if (weekNumber !== currentWeek) {
            weeksNb.push(weekNumber);
            currentWeek = weekNumber; // Update the current week
        }
    }

    // Special handling for the transition between years
    if (month === 12 && !weeksNb.includes(1)) {
        // Check if the first week of next year should be included
        const firstWeekOfNextYear = getWeekNumber(new Date(year + 1, 0, 1));
        if (firstWeekOfNextYear === 1) {
            weeksNb.push(firstWeekOfNextYear);
        }
    }

    return weeksNb;
};


/**
 * 
 * @param {Date} d date to get the week number from
 * @returns 
 */
function getWeekNumber(d) {
    // Convert the date to UTC
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Adjust the date to be Thursday of the same week (ISO week)
    // ISO weeks start on Monday; 4 represents Thursday
    const dayOffsetToThursday = 4;
    const isoWeekStartDay = 1; // Monday as the start day of ISO week
    const millisecondsPerDay = 86400000; // Number of milliseconds in a day
    const daysInWeek = 7;

    d.setUTCDate(d.getUTCDate() + dayOffsetToThursday - (d.getUTCDay() || daysInWeek));
    
    // Calculate the start of the year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    
    // Calculate the ISO week number
    // Add 1 because division starts at 0
    return Math.ceil(((d - yearStart) / millisecondsPerDay + 1) / daysInWeek);
}




const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

module.exports = {
    daysInMonth,
    getWeeksNb,
    dayNames
}