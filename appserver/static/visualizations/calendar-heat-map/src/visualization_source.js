define([
	"jquery",
	"underscore",
	"api/SplunkVisualizationBase",
	"api/SplunkVisualizationUtils",
], function ($, _, SplunkVisualizationBase, SplunkVisualizationUtils) {
	return SplunkVisualizationBase.extend({
		initialize: function () {
			this.chunk = 50000;
			this.offset = 0;
			// Save this.$el for convenience
			this.$el = $(this.el);

			// Add a css selector class
			this.$el.addClass("heat-map");
		},

		getInitialDataParams: function () {
			return {
				outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
				count: 10000,
			};
		},

		formatData: function (data, config) {
			if (!data) return;
			console.log(data, config)

			// Get the fields
			const fields = data.fields.map((field) => field.name);

			const mandatoryFields = ["_time", "threshold_critical", "threshold_warning", "value"];

			// Check if all mandatory fields are present
			const missingFields = mandatoryFields.filter((field) => !fields.includes(field));

			if (missingFields.length > 0) {
				throw new SplunkVisualizationBase.VisualizationError(`missing fields: ${missingFields.join(", ")}`);
			}
			return data;

		},

		updateView: function (data, config) {

			// Extract rows from data
			const dataRows = data.rows;

			// Check if data is empty
			if (!dataRows || dataRows.length === 0 || dataRows[0].length === 0) return this;
			const tabMonth = [];
			for (const row of dataRows) {
				const [_time, threshold_critical, threshold_moderate, value] = row.map(item => isNaN(item) ? item : Number(item));
				const obj = { _time, threshold_critical, threshold_moderate, value };

				if (new Date(_time).getMonth() in tabMonth) {
					tabMonth[new Date(_time).getMonth()].push(obj);
				} else {
					tabMonth[new Date(_time).getMonth()] = [obj];
				}

			}
			console.log(tabMonth);

			// Clear the div
			this.$el.empty();

			// Create a first div with the class "global-container"
			let res = document.createElement("div");
			res.classList.add("global-container");
			// Get the number of days in the month of the first row
			const { daysInMonth, getWeeksNb } = require("utils/date");

			for (const month of tabMonth) {
				if (!month) continue;

				// Create a "p" element with the class "month-name" and the name of the month 
				let monthName = document.createElement("p");
				monthName.classList.add("month-name");
				monthName.innerText = new Date(month[0]._time).toLocaleString("default", { month: "long" });

				let gloablContainerMonth = document.createElement("div");
				gloablContainerMonth.classList.add("gloabl-container-month");

				gloablContainerMonth.append(monthName);


				// Create a new div and add the class "container-month" to it
				let monthContainer = document.createElement("div");
				monthContainer.classList.add("container-month");

				const dateFirstRow = new Date(dataRows[0][0]);
				const monthRow = dateFirstRow.getMonth();
				const yearRow = dateFirstRow.getFullYear();

				// Create day names
				const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
				for (let i = 0; i < dayNames.length; i++) {
					let dayName = document.createElement("div");
					dayName.classList.add("day-name");
					dayName.innerText = dayNames[i];
					dayName.style.gridRow = 1;
					dayName.style.gridColumn = i + 2; // Start from column 2 to align with the first day of the week
					monthContainer.append(dayName);
				}

				// get week number
				const weeksNb = getWeeksNb(monthRow + 1, yearRow);

				for (let i = 0; i < weeksNb.length; i++) {
					let week = document.createElement("div");
					week.classList.add("week");
					week.innerText = 'W' + weeksNb[i];
					week.style.gridRow = i + 2;
					week.style.gridColumn = 1;
					monthContainer.append(week);
				}
				// Get the day of the week of the first day of the month
				const firstDayOfMonth = new Date(yearRow, monthRow, 1);
				const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert so that Monday is 0, Sunday is 6

				const nbDaysInMonth = daysInMonth(monthRow + 1, yearRow);

				// Create the days
				for (let i = 0; i < nbDaysInMonth; i++) {

					let day = document.createElement("div");
					day.classList.add("day");
					day.innerText = i + 1;

					// Calculate the position of the day in the grid
					let column = ((firstDayOfWeek + i) % 7) + 2; // Offset by 2 to align with day names
					let row = Math.floor((firstDayOfWeek + i) / 7) + 2; // Offset by 2 to start from the second row

					day.style.gridColumn = column;
					day.style.gridRow = row;

					monthContainer.append(day);
				}

				let averagePerMonth = 0

				// Color the days depending on the data
				month.forEach(({ _time, value, threshold_critical, threshold_moderate }) => {

					const dayNumber = new Date(_time).getDate();
					const dayElement = monthContainer.querySelector(`.day:nth-child(${dayNumber + dayNames.length})`); // Offset by dayNames.length to account for day name elements

					averagePerMonth += value;

					if (dayElement) {
						if (value > threshold_critical) {
							dayElement.classList.add("critical");
						} else if (value > threshold_moderate) {
							dayElement.classList.add("moderate");
						} else {
							dayElement.classList.add("normal");
						}
					}
				});

				averagePerMonth /= dataRows.length;
				// create a div for the average value with the class "average"
				let average = document.createElement("div");
				average.classList.add("average");

				// set the color depending on the average value
				if (averagePerMonth > 50) {
					average.classList.add("critical");
				} else if (averagePerMonth > 30) {
					average.classList.add("moderate");
				} else {
					average.classList.add("normal");
				}

				average.innerText = averagePerMonth.toFixed(2);

				// Append 
				gloablContainerMonth.append(monthContainer);
				gloablContainerMonth.append(average);

				res.append(gloablContainerMonth)

			}

			this.$el.append(res);
		}



	});
});
