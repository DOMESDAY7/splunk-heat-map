const { rowDataToMapMonth, createDays, createDaysName, colorDays } = require('./helper');
const { JSDOM } = require('jsdom');
const { daysInMonth } = require('../date/date');

describe('rowDataToTabMonth', () => {
    test('should throw an error if row length is less than 4', () => {
        const rowData = [
            ['2022-01-01', 10, 20]
        ];
        expect(() => rowDataToMapMonth(rowData)).toThrow('Missing fields');
    });

    test('should convert numeric strings to numbers', () => {
        const rowData = [
            ['2022-01-01', '10', '20', '30']
        ];
        const result = rowDataToMapMonth(rowData);
        expect(result.get('1-2022')[0]).toEqual({
            _time: '2022-01-01',
            threshold_critical: 10,
            threshold_moderate: 20,
            value: 30
        });
    });

    test('should group rows by month and year', () => {
        const rowData = [
            ['2022-01-01', '10', '20', '30'],
            ['2022-01-02', '40', '50', '60'],
            ['2022-02-01', '70', '80', '90']
        ];
        const result = rowDataToMapMonth(rowData);

        expect(result.get('1-2022')).toHaveLength(2);
    });

    test('should handle empty input', () => {
        const rowData = [];
        const result = rowDataToMapMonth(rowData);
        expect(result).toEqual(new Map());
    });
});

describe('createDays', () => {
    let container;

    beforeEach(() => {
        const dom = new JSDOM('<html><body></body></html>');
        global.document = dom.window.document;
        container = document.createElement('div');
    });

    afterEach(() => {
        delete global.document;
    });

    test('should create the correct number of days', () => {
        createDays(30, 1, container);
        const days = container.querySelectorAll('.day');
        expect(days.length).toBe(30);
    });

    test('should correctly set the text of each day', () => {
        createDays(30, 1, container);
        const days = container.querySelectorAll('.day');
        days.forEach((day, i) => {
            expect(day.textContent).toBe((i + 1).toString());
        });
    });

    test('should correctly calculate the grid position of each day', () => {
        createDays(30, 1, container);
        const days = container.querySelectorAll('.day');
        days.forEach((day, i) => {
            const column = ((1 + i) % 7) + 2;
            const row = Math.floor((1 + i) / 7) + 2;
            expect(day.style.gridColumn).toBe(column.toString());
            expect(day.style.gridRow).toBe(row.toString());
        });
    });

    test('should append each day to the container', () => {
        createDays(30, 1, container);
        const days = container.querySelectorAll('.day');
        days.forEach((day) => {
            expect(day.parentNode).toBe(container);
        });
    });
});

describe('createDaysName', () => {
    let container;

    beforeEach(() => {
        const dom = new JSDOM('<html><body></body></html>');
        global.document = dom.window.document;
        container = document.createElement('div');
    });

    afterEach(() => {
        delete global.document;
    });

    test('should create the correct number of day names', () => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        createDaysName(dayNames, container);
        const dayNameElements = container.querySelectorAll('.day-name');
        expect(dayNameElements.length).toBe(dayNames.length);
    });

    test('should correctly set the text of each day name', () => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        createDaysName(dayNames, container);
        const dayNameElements = container.querySelectorAll('.day-name');
        dayNameElements.forEach((dayNameElement, i) => {
            expect(dayNameElement.textContent).toBe(dayNames[i]);
        });
    });

    test('should correctly calculate the grid position of each day name', () => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        createDaysName(dayNames, container);
        const dayNameElements = container.querySelectorAll('.day-name');
        dayNameElements.forEach((dayNameElement, i) => {
            expect(dayNameElement.style.gridColumn).toBe((i + 2).toString());
            expect(dayNameElement.style.gridRow).toBe('1');
        });
    });

    test('should append each day name to the container', () => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        createDaysName(dayNames, container);
        const dayNameElements = container.querySelectorAll('.day-name');
        dayNameElements.forEach((dayNameElement) => {
            expect(dayNameElement.parentNode).toBe(container);
        });
    });
});


describe("rowDataToTabMonth + createDays + createDaysName", () => {
    let container;

    beforeEach(() => {
        const dom = new JSDOM('<html><body></body></html>');
        global.document = dom.window.document;
        container = document.createElement('div');
    });

    test("create two month but not the same year", () => {
        const rowData = [
            ['2024-01-01', '10', '20', '30'],
            ['2023-01-02', '40', '50', '60'],
        ];
        const result = rowDataToMapMonth(rowData);

        for (const [month, tab] of result) {

            const dateFirstRow = new Date(tab[0]._time);
            const monthRow = dateFirstRow.getMonth();
            const yearRow = dateFirstRow.getFullYear();

            // Get the day of the week of the first day of the month
            const firstDayOfMonth = new Date(yearRow, monthRow, 1);

            // Convert so that Monday is 0, Sunday is 6
            const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

            const nbDaysInMonth = daysInMonth(monthRow + 1, yearRow);

            let div = document.createElement("div");
            div.classList.add("container-month");
            container.append(div);

            createDays(nbDaysInMonth, firstDayOfWeek, div);
        }

        const days = container.querySelectorAll('.day');
        expect(days.length).toBe(31 * 2);

        const containerMonth = container.querySelectorAll('.container-month');
        expect(containerMonth.length).toBe(2);
    });

});

describe('colorDays', () => {
    let container;
    let tabMonth;
    let dayNames;

    beforeEach(() => {
        const dom = new JSDOM('<html><body></body></html>');
        global.document = dom.window.document;
        container = document.createElement('div');
        dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        tabMonth = new Map([
            ['1-2022', [
                { _time: '2022-01-01', value: 99, threshold_critical: 95, threshold_moderate: 98 },
                { _time: '2022-01-02', value: 97, threshold_critical: 95, threshold_moderate: 98 },
                { _time: '2022-01-03', value: 5, threshold_critical: 95, threshold_moderate: 98 },
                { _time: '2022-01-04', value: 100, threshold_critical: 95, threshold_moderate: 98 },
                { _time: '2022-01-05', value: 98, threshold_critical: 95, threshold_moderate: 98 },
            ]]
        ])

        createDays(31, 1, container);
        createDaysName(dayNames, container);

    });

    afterEach(() => {
        delete global.document;
    });

    test('should correctly color days based on thresholds', () => {
        const result = colorDays(tabMonth, '1-2022', container);
        expect(result).toBe(true);

        const dayElements = container.querySelectorAll('.day');


        expect(dayElements[0].classList.contains('normal')).toBe(true);
        expect(dayElements[1].classList.contains('moderate')).toBe(true);
        expect(dayElements[2].classList.contains('critical')).toBe(true);
        expect(dayElements[3].classList.contains('normal')).toBe(true);
        expect(dayElements[4].classList.contains('moderate')).toBe(true);
    });

    test('should return false and not throw an error if a day element is not found', () => {
        tabMonth.get('1-2022').push({ _time: '2022-01-32', value: 10, threshold_critical: 20, threshold_moderate: 15 });
        const result = colorDays({ tabMonth, month: '1-2022', monthContainer: container, dayNames });
        expect(result).toBe(false);
    });
});
