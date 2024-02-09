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

			// Get the fields
			const fields = data.fields.map((field) => field.name);

			const mandatoryFields = ["_time", "threshold_critical", "threshold_moderate", "value"];

			// Check if all mandatory fields are present
			const missingFields = mandatoryFields.filter((field) => !fields.includes(field));

			if (missingFields.length > 0) {
				throw new SplunkVisualizationBase.VisualizationError(`missing fields: ${missingFields.join(", ")}`);
			}
			return data;

		},

		updateView: function (data, config) {

			const getConfigVar = (string, defaultValue) => {
				return config[this.getPropertyNamespaceInfo().propertyNamespace + string] || defaultValue;
			}

			const { rowDataToMapMonth, createDays, createDaysName, colorDays } = require("./utils/helper");
			const { daysInMonth, getWeeksNb, dayNames } = require("date/date");

			// Clear the display div
			this.$el.empty();

			// get color from the config
			const criticalColor = getConfigVar('criticalColor', "#c05c5c");
			const moderateColor = getConfigVar('moderateColor', "#c09a5c");
			const normalColor = getConfigVar('normalColor', "#5cc05c");

			// var noDataColor = config[this.getPropertyNamespaceInfo().propertyNamespace + 'noDataColor'] || "#c09a5c";

			// get data or day number
			const isDayNb = getConfigVar('isDayNb', false) === "true";
			const isSundayGray = getConfigVar('sundayGray', false) === "true";

			const root = document.querySelector(":root");
			root.style.setProperty("--critical-color", criticalColor);
			root.style.setProperty("--moderate-color", moderateColor);
			root.style.setProperty("--normal-color", normalColor);

			// we configure the font size depending on what we want to display
			root.style.setProperty("--day-font-size", !isDayNb ? "0.5rem" : "1rem");
			// Check if data is empty
			const tabMonth = rowDataToMapMonth(data);

			// Create a first div with the class "global-container"
			let res = document.createElement("div");
			res.classList.add("global-container");

			// Get the number of days in the month of the first row
			for (const [month, tabMonthData] of tabMonth) {
				if (!tabMonthData) continue;

				// Create a "p" element with the class "month-name" and the name of the month 
				let monthName = document.createElement("p");
				monthName.classList.add("month-name");
				monthName.innerText = new Date(tabMonthData[0]._time).toLocaleString("default", { month: "long", year: "numeric" });

				let globalContainerMonth = document.createElement("div");
				globalContainerMonth.classList.add("global-container-month");

				globalContainerMonth.append(monthName);

				// Create a new div and add the class "container-month" to it
				let monthContainer = document.createElement("div");
				monthContainer.classList.add("container-month");

				const dateFirstRow = new Date(tabMonthData[0]._time);
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

				createDays(nbDaysInMonth, firstDayOfWeek, monthContainer, isSundayGray);

				colorDays(tabMonthData, monthContainer, isDayNb, isSundayGray);

				// Filter the data to remove the empty values
				const tabMonthDataFiltered = tabMonthData.filter((el) => !!el.value);

				const averagePerMonth = tabMonthDataFiltered.reduce((acc, { value }) => acc + value, 0) / tabMonthDataFiltered.length;

				// create a div for the average value with the class "average"
				let average = document.createElement("div");
				average.classList.add("average");

				const critical = config[this.getPropertyNamespaceInfo().propertyNamespace + 'critical'] || 98;
				const moderate = config[this.getPropertyNamespaceInfo().propertyNamespace + 'moderate'] || 99;

				// set the color depending on the average value
				if (averagePerMonth < critical) {
					average.classList.add("critical");
				} else if (critical < averagePerMonth < moderate) {
					average.classList.add("moderate");
				} else {
					average.classList.add("normal");
				}

				let p = document.createElement("p");

				p.classList.add("average-value");
				p.textContent = averagePerMonth.toFixed(2);
				average.append(p);

				// Append 
				globalContainerMonth.append(monthContainer);
				globalContainerMonth.append(average);

				res.append(globalContainerMonth)

			}

			let tooltip = document.createElement("div");
			tooltip.classList.add("tooltip-chm");
			res.append(tooltip);

			const offsetPx = 5;

			res.addEventListener("mousemove", (e) => {
				if (e.target.classList.contains("day")) {
					const resRect = res.getBoundingClientRect();

					// Update the tooltip content and make it visible
					tooltip.innerText = e.target.getAttribute("data-tooltip");
					tooltip.style.display = "block";
					tooltip.style.visibility = 'visible';

					// Position the tooltip to follow the mouse cursor within the `res`
					// Adjusting for the offset and ensuring it's positioned correctly relative to `res`
					tooltip.style.left = `${e.clientX - resRect.left + offsetPx}px`;
					tooltip.style.top = `${e.clientY - resRect.top + offsetPx}px`;
				} else {
					tooltip.style.display = "none";
				}
			});

			// Hide the tooltip when not hovering over a `day` element
			res.addEventListener("mouseleave", () => {
				tooltip.style.display = "none";
			});

			this.$el.append(res);
		}

	});
});
