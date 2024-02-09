const { dayNames } = require('date/date')
/**
 * 
 * @param {Array[]} rowData data from splunk : _time, threshold_critical, threshold_moderate, value
 * @returns {Map} tabMonth : Map => [[month : [{_time, threshold_critical, threshold_moderate, value}]]]
 */
const rowDataToMapMonth = (data) => {
    if (Object.keys(data).length == 0 || data.rows.length == 0 || data.fields.length == 0) return new Map();

    const tabFields = data.fields.map((field) => field.name);
    const fieldIndices = {
        _time: tabFields.indexOf("_time"),
        threshold_critical: tabFields.indexOf("threshold_critical"),
        threshold_moderate: tabFields.indexOf("threshold_moderate"),
        value: tabFields.indexOf("value"),
    };

    if (
        !Object.values(fieldIndices).every((index) => index !== -1) ||
        data.rows.some((row) => row.length < 4)
    ) {
        throw new Error("Missing fields");
    }

    const tabMonth = new Map();

    for (const row of data.rows) {
        const [_time, threshold_critical, threshold_moderate, value] = row.map(
            (item, index) => {
                if (index == fieldIndices._time) {
                    return item
                } else if (index === fieldIndices.threshold_critical ||
                    index === fieldIndices.threshold_moderate ||
                    index === fieldIndices.value) {
                    return parseFloat(item)
                } else {
                    return item
                }
            });

        const eventDate = new Date(_time);
        const propertyName = `${eventDate.getMonth() + 1}-${eventDate.getFullYear()}`;

        const obj = {
            _time,
            threshold_critical,
            threshold_moderate,
            value,
        };

        tabMonth.has(propertyName)
            ? tabMonth.get(propertyName).push(obj)
            : tabMonth.set(propertyName, [obj]);
    }

    return tabMonth;
};



/**
 * 
 * @param {number} nbDaysInMonth number of days in the month
 * @param {number} firstDayOfWeek day of the week of the first day of the month
 * @param {HTMLDivElement} monthContainer div of the month
 */
function createDays(nbDaysInMonth, firstDayOfWeek, monthContainer, isSundayGray = false) {
    const offset = 2; // Offset to align with day names and start from the second row
    const fragment = document.createDocumentFragment();

    // Calculate the values outside the loop to save computation time
    const moduloValues = Array.from({ length: nbDaysInMonth }).map((_, i) => (firstDayOfWeek + i) % 7 + offset);
    const floorValues = Array.from({ length: nbDaysInMonth }).map((_, i) => Math.floor((firstDayOfWeek + i) / 7) + offset);

    for (let i = 0; i < nbDaysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i + 1;
        day.style = "grid-column: " + moduloValues[i] + "; grid-row: " + floorValues[i];
        day.setAttribute("data-day", i + 1);
        day.setAttribute("data-tooltip", `day ${i + 1}`)
        const dayName = dayNames[(firstDayOfWeek + i) % 7]
        day.setAttribute("data-day-name", dayName);
        if (dayName == "Sun" && isSundayGray) {
            day.classList.add("sunday");
        }
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
function colorDays(tabData, monthContainer, isDayNb = false, isSundayGray = false) {
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

        if (dayElement && value) {
            if (isSundayGray && dayElement.classList.contains("sunday")) {
                continue;
            }

            if (value >= 0 && value <= threshold_critical) {
                dayElement.classList.add("critical");
            } else if (value >= threshold_critical && value <= threshold_moderate) {
                dayElement.classList.add("moderate");
            } else {
                dayElement.classList.add("normal");
            }
            dayElement.setAttribute("data-tooltip", `day ${new Date(_time).getDate()} : ${value.toFixed(2)}%`);
            if (!isDayNb) dayElement.textContent = value.toFixed(2) + "%";

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