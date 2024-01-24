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
    const lastWeekNumber = getWeekNumber(lastDayOfMonth);

    const weeksNb = [];
    let currentWeekNumber = firstWeekNumber;
    while (currentWeekNumber <= lastWeekNumber) {
        weeksNb.push(currentWeekNumber);
        currentWeekNumber = firstDayOfMonth.getDay() === 0 && currentWeekNumber === firstWeekNumber ? currentWeekNumber + 2 : currentWeekNumber + 1;
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 7);
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


module.exports = {
    daysInMonth,
    getWeeksNb,
    
}