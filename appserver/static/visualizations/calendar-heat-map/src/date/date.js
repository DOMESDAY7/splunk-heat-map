const daysInMonth = (month, year) => {
    if (month < 1 || month > 12) throw new Error("Invalid month");
    if (year <= 0) throw new Error("Invalid year");
    return new Date(year, month, 0).getDate();
};

/**
 * 
 * @param month the month number (1-12)
 * @param year  the year
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


// Helper function to get the ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}


const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

module.exports = {
    daysInMonth,
    getWeeksNb,
    dayNames
}