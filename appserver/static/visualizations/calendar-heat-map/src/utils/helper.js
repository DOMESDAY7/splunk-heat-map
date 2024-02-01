/**
 * 
 * @param {Array[]} rowData data from splunk : _time, threshold_critical, threshold_moderate, value
 * @returns {Map} tabMonth : {month : [{_time, threshold_critical, threshold_moderate, value}]}
 */
const rowDataToMapMonth = (rowData) => {
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
    const offset = 2; // Offset to align with day names and start from the second row
    const fragment = document.createDocumentFragment();

    // Calculate the values outside the loop to save computation time
    const moduloValues = Array.from({ length: nbDaysInMonth }).map((_, i) => (firstDayOfWeek + i) % 7 + offset);
    const floorValues = Array.from({ length: nbDaysInMonth }).map((_, i) => Math.floor((firstDayOfWeek + i) / 7) + offset);

    for (let i = 0; i < nbDaysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i + 1;

        day.style.gridColumn = moduloValues[i];
        day.style.gridRow = floorValues[i];
        day.setAttribute("data-day", i + 1);

        fragment.appendChild(day);
    }

    monthContainer.append(fragment);
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
 * @param {Array} tabData  
 * @param {HTMLDivElement} monthContainer 
 * @returns void
 */
function colorDays(tabData, monthContainer) {
    const daysMap = new Map(tabData.map((item) => {
        const date = new Date(item._time);
        // Validate the date to ensure it exists
        if (date.toString() === "Invalid Date" || new Date(item._time).getDate() !== parseInt(item._time.split('-')[2], 10)) {
            throw new Error(`Invalid or nonexistent day: ${item._time}`);
        }
        return [`[data-day='${date.getDate()}']`, item];
    }));

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
}

module.exports = {
    rowDataToMapMonth,
    createDays,
    createDaysName,
    colorDays
}