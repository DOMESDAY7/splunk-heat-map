const daysInMonth = (month, year) => {
    if (month < 1 || month > 12) {
        throw new Error("Invalid month");
    }
    return new Date(year, month, 0).getDate();
};

/**
 * 
 * @param month the month number (1-12)
 * @param year  the year
 * @return an array of number, each number represent the number of the week in the month depending on the month and the year
 */
const getWeeksNb = (month, year) => {
    if (month < 1 || month > 12) {
        throw new Error("Invalid month");
    }

    const nbDaysInMonth = daysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month - 1, nbDaysInMonth);

    let firstWeekNumber = getWeekNumber(firstDayOfMonth);
    let lastWeekNumber = getWeekNumber(lastDayOfMonth);

    // Handling the year transition
    if (lastDayOfMonth.getMonth() === 11 && lastWeekNumber === 1) {
        lastWeekNumber = 53; // Set to a high number to include week 1 of next year
    }

    const weeksNb = [];
    let currentWeek = firstWeekNumber;
    while (currentWeek <= lastWeekNumber) {
        weeksNb.push(currentWeek === 53 ? 1 : currentWeek); // Reset to 1 for the new year

        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 7);
        currentWeek = getWeekNumber(firstDayOfMonth);

        // Handling the reset to week 1 in the new year
        if (firstDayOfMonth.getFullYear() > year && currentWeek > 1) {
            break;
        }
    }

    return weeksNb;
};


// Helper function to get the ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}


const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

module.exports = {
    daysInMonth,
    getWeeksNb,
    dayNames    
}