const daysInMonth = require('./date');

describe('daysInMonth', () => {
    test('February in a leap year', () => {
        expect(daysInMonth(2, 2020)).toBe(29);
    });

    test('February in a non-leap year', () => {
        expect(daysInMonth(2, 2021)).toBe(28);
    });

    test('Month with 30 days', () => {
        expect(daysInMonth(4, 2021)).toBe(30);
    });

    test('Month with 31 days', () => {
        expect(daysInMonth(1, 2021)).toBe(31);
    });

    test('Invalid month', () => {
        expect(() => daysInMonth(13, 2021)).toThrow();
    });
});