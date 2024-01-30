const { rowDataToTabMonth, createDays, createDaysName } = require('./helper');
const { JSDOM } = require('jsdom');

describe('rowDataToTabMonth', () => {
    test('should throw an error if row length is less than 4', () => {
        const rowData = [
            ['2022-01-01', 10, 20]
        ];
        expect(() => rowDataToTabMonth(rowData)).toThrow('Missing fields');
    });

    test('should convert numeric strings to numbers', () => {
        const rowData = [
            ['2022-01-01', '10', '20', '30']
        ];
        const result = rowDataToTabMonth(rowData);
        expect(result['1-2022'][0]).toEqual({
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
        const result = rowDataToTabMonth(rowData);

        expect(result['1-2022']).toHaveLength(2);
    });

    test('should handle empty input', () => {
        const rowData = [];
        const result = rowDataToTabMonth(rowData);
        expect(result).toEqual({});
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
        console.log(container.outerHTML); // Log the outer HTML of the container
        console.log(days.length); // Log the number of elements selected
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


// describe("create two similar month but different year", () => {
//     test("")

// }),
