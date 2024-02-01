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
			const { rowDataToMapMonth, createDays, createDaysName, colorDays } = require("./utils/helper");
			const { daysInMonth, getWeeksNb, dayNames } = require("date/date");

			// Clear the display div
			this.$el.empty();

			// Extract rows from data
			const dataRows = data.rows;

			// Check if data is empty
			if (!dataRows || dataRows.length === 0 || dataRows[0].length === 0) return this;

			const tabMonth = rowDataToMapMonth(dataRows);
			console.log(tabMonth)

			// Create a first div with the class "global-container"
			let res = document.createElement("div");
			res.classList.add("global-container");

			// Get the number of days in the month of the first row
			for (const [month, value] of tabMonth) {
				if (!value) continue;

				// Create a "p" element with the class "month-name" and the name of the month 
				let monthName = document.createElement("p");
				monthName.classList.add("month-name");
				monthName.innerText = new Date(value[0]._time).toLocaleString("default", { month: "long", year: "numeric" });

				let globalContainerMonth = document.createElement("div");
				globalContainerMonth.classList.add("global-container-month");

				globalContainerMonth.append(monthName);

				// Create a new div and add the class "container-month" to it
				let monthContainer = document.createElement("div");
				monthContainer.classList.add("container-month");

				const dateFirstRow = new Date(value[0]._time);
				const monthRow = dateFirstRow.getMonth();
				const yearRow = dateFirstRow.getFullYear();

				createDaysName(dayNames, monthContainer);

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

				// Convert so that Monday is 0, Sunday is 6
				const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

				const nbDaysInMonth = daysInMonth(monthRow + 1, yearRow);

				createDays(nbDaysInMonth, firstDayOfWeek, monthContainer);

				colorDays(tabMonth, month, monthContainer, dayNames);

				const averagePerMonth = value.reduce((acc, { value }) => acc + value, 0) / value.length;

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
				globalContainerMonth.append(monthContainer);
				globalContainerMonth.append(average);

				res.append(globalContainerMonth)

			}

			this.$el.append(res);
		}



	});
});
