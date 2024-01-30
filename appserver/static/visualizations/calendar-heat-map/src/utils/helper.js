/**
 * 
 * @param {Array[]} rowData data from splunk : _time, threshold_critical, threshold_moderate, value
 * @returns {Object} tabMonth : {month : [{_time, threshold_critical, threshold_moderate, value}]}
 */
const rowDataToTabMonth = (rowData) => {
    const tabMonth = {};
    for (const row of rowData) {
        if (row.length < 4) throw Error("Missing fields");
        const [_time, threshold_critical, threshold_moderate, value] = row.map(item => isNaN(item) ? item : Number(item));

        const obj = { _time, threshold_critical, threshold_moderate, value };
        const dateRow = new Date(_time);

        const propertyName = `${dateRow.getMonth() + 1}-${dateRow.getYear() + 1900}`;

        if (propertyName in tabMonth) {
            tabMonth[propertyName].push(obj);
        } else {
            tabMonth[propertyName] = [obj];
        }
    }
    return tabMonth;
}

/**
 * 
 * @param {number} nbDaysInMonth number of days in the month
 * @param {number} firstDayOfWeek day of the week of the first day of the month
 * @param {HTMLDivElement} monthContainer div of the month
 */
function createDays(nbDaysInMonth, firstDayOfWeek, monthContainer) {
    // Create the days
    for (let i = 0; i < nbDaysInMonth; i++) {

        let day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i + 1;

        // Calculate the position of the day in the grid
        let column = ((firstDayOfWeek + i) % 7) + 2; // Offset by 2 to align with day names
        let row = Math.floor((firstDayOfWeek + i) / 7) + 2; // Offset by 2 to start from the second row

        day.style.gridColumn = column;
        day.style.gridRow = row;

        monthContainer.append(day);
    }

}

/**
 * 
 * @param {string[]} dayNames : array of the day names
 * @param {HTMLDivElement} monthContainer : div of the month
 */
function createDaysName(dayNames, monthContainer) {
    // Create day names
    for (const [i, day] of dayNames.entries()) {
        let dayName = document.createElement("div");
        dayName.classList.add("day-name");
        dayName.textContent = day;
        dayName.style.gridRow = 1;
        dayName.style.gridColumn = i + 2; // Start from column 2 to align with the first day of the week
        monthContainer.append(dayName);
    }
}


module.exports = {
    rowDataToTabMonth,
    createDays,
    createDaysName
}