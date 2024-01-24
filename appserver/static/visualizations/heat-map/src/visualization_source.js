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
			// Log the data and config for debugging purposes
			console.log("updateView", data, config);
		
			// Extract rows from data
			var dataRows = data.rows;
		
			// Check if data is empty
			if (!dataRows || dataRows.length === 0 || dataRows[0].length === 0) {
				return this;
			}
		
			// Clear the div
			this.$el.empty();
		
			// Create a new div and add the class "container-month" to it
			let res = document.createElement("div");
			res.classList.add("container-month");
		
			// Get the number of days in the month of the first row
			const { daysInMonth } = require("utils/date");
			const dateFirstRow = new Date(dataRows[0][0]);
			const month = dateFirstRow.getMonth();
			const year = dateFirstRow.getFullYear();
			const nbDaysInMonth = daysInMonth(month, year);
		
			const daysArray = [];
			// Create the days
			for (let i = 0; i < nbDaysInMonth; i++) {
				let day = document.createElement("div");
				day.classList.add("day");
				day.innerText = i + 1;
				daysArray.push(day);
			}
		
			// Append the days to the res div
			daysArray.forEach(day => res.append(day));
		
			// Color the days depending on the data
			dataRows.forEach(row => {
				const [_time, threshold_critical, threshold_moderate, value] = row.map(item => isNaN(item) ? item : Number(item));

				console.log(_time, threshold_critical, threshold_moderate, data)

				const dayNumber = new Date(_time).getDate();
				const day = res.children[dayNumber - 1];
				if (!day) return;
				if (value > threshold_critical) {
					day.classList.add("critical");
				} else if (value > threshold_moderate) {
					day.classList.add("moderate");
				} else {
					day.classList.add("normal");
				}
			});
		
			// Append the res div to the main div
			this.$el.append(res);
		}
		

	});
});
