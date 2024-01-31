/**
 * 
 * @param {Array[]} rowData data from splunk : _time, threshold_critical, threshold_moderate, value
 * @returns {Map} tabMonth : {month : [{_time, threshold_critical, threshold_moderate, value}]}
 */
const rowDataToTabMonth = (rowData) => {
    const tabMonth = new Map();
    for (const row of rowData) {
        if (row.length < 4) throw Error("Missing fields");
        const [_time, threshold_critical, threshold_moderate, value] = row.map(item => isNaN(item) ? item : Number(item));

        const obj = { _time, threshold_critical, threshold_moderate, value };
        const dateRow = new Date(_time);

        const propertyName = `${dateRow.getMonth() + 1}-${dateRow.getYear() + 1900}`;

        if (tabMonth.has(propertyName)) {
            tabMonth.get(propertyName).push(obj);
        } else {
            tabMonth.set(propertyName, [obj]);
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
        day.setAttribute("data-day", i + 1);

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

/**
 * 
 * @param {Map} tabMonth 
 * @param {string} month 
 * @param {HTMLDivElement} monthContainer 
 * @returns boolean
 */
function colorDays(tabMonth, month, monthContainer) {
    try {
        if (tabMonth.has(month)) {
            const daysMap = new Map(tabMonth.get(month).map((item) => [`[data-day='${new Date(item._time).getDate()}']`, item]));

            for (const [selector, { _time, value, threshold_critical, threshold_moderate }] of daysMap) {
                const dayElement = monthContainer.querySelector(selector);

                if (dayElement) {
                    if (value > 0 && value <= threshold_critical) {
                        dayElement.classList.add("critical");
                    } else if (value > threshold_critical && value <= threshold_moderate) {
                        dayElement.classList.add("moderate");
                    } else {
                        dayElement.classList.add("normal");
                    }
                } else {
                    throw Error("dayElement is undefined");
                }
            }
            return true;
        } else {
            throw Error("Month not found in tabMonth");
        }
    } catch (e) {
        return false;
    }
}






module.exports = {
    rowDataToTabMonth,
    createDays,
    createDaysName,
    colorDays
}