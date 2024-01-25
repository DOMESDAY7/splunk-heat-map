define([
	"jquery",
	"underscore",
	"api/SplunkVisualizationBase",
	"api/SplunkVisualizationUtils",
	"d3",
], function ($, _, SplunkVisualizationBase, SplunkVisualizationUtils, d3) {
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
			var dataRows = data.rows;

			// Check if data is empty
			if (!dataRows || dataRows.length === 0 || dataRows[0].length === 0) return this;


			// Clear the div
			this.$el.empty();

			// Create a first div with the class "global-container"
			let res = document.createElement("div");
			res.classList.add("global-container");

			// Create a new div and add the class "container-month" to it
			let monthContainer = document.createElement("div");
			monthContainer.classList.add("container-month");

			// Get the number of days in the month of the first row
			const { daysInMonth, getWeeksNb } = require("utils/date");

			const dateFirstRow = new Date(dataRows[0][0]);
			const month = dateFirstRow.getMonth();
			const year = dateFirstRow.getFullYear();

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

			const weeksNb = getWeeksNb(month + 1, year);

			for (let i = 0; i < weeksNb.length; i++) {
				let week = document.createElement("div");
				week.classList.add("week");
				week.innerText = 'W' + weeksNb[i];
				week.style.gridRow = i + 2;
				week.style.gridColumn = 1;
				monthContainer.append(week);
			}

			// Get the day of the week of the first day of the month
			const firstDayOfMonth = new Date(year, month, 1);
			const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert so that Monday is 0, Sunday is 6

			const nbDaysInMonth = daysInMonth(month + 1, year);

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

			// Color the days depending on the data
			dataRows.forEach(row => {
				const [_time, threshold_critical, threshold_moderate, value] = row.map(item => isNaN(item) ? item : Number(item));
				const dayNumber = new Date(_time).getDate();
				const dayElement = monthContainer.querySelector(`.day:nth-child(${dayNumber + dayNames.length})`); // Offset by dayNames.length to account for day name elements

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

			res.append(monthContainer);
			this.$el.append(res);
		}



	});
});
