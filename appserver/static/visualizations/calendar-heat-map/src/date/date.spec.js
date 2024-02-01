const { daysInMonth, getWeeksNb } = require('./date');

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

    test('February in a negative year', () => {
        expect(() => daysInMonth(2, -2020)).toThrow();
    });

    test('Zero as month', () => {
        expect(() => daysInMonth(0, 2021)).toThrow();
    });

    test('Zero as year', () => {
        expect(() => daysInMonth(3, 0)).toThrow();
    });

    test('Negative month', () => {
        expect(() => daysInMonth(-1, 2021)).toThrow();
    });

    test('Negative year', () => {
        expect(() => daysInMonth(3, -2021)).toThrow();
    });
});


describe('getWeeksNb', () => {

    test('January', () => {
        expect(getWeeksNb(1, 2024)).toEqual([1, 2, 3, 4, 5]);
    });

    test('February', () => {
        expect(getWeeksNb(2, 2024)).toEqual([5, 6, 7, 8, 9]);
    });

    test('March', () => {
        expect(getWeeksNb(3, 2024)).toEqual([9, 10, 11, 12, 13]);
    });

    test('December', () => {
        expect(getWeeksNb(12, 2024)).toEqual([48, 49, 50, 51, 52, 1]);
    });

    test('Invalid month', () => {
        expect(() => getWeeksNb(13, 2022)).toThrow();
    });


    test('Negative year', () => {
        expect(() => getWeeksNb(2, -2024)).toThrow();
    });

    test('Zero as month', () => {
        expect(() => getWeeksNb(0, 2024)).toThrow();
    });

    test('Zero as year', () => {
        expect(() => getWeeksNb(6, 0)).toThrow();
    });

    test('Negative month', () => {
        expect(() => getWeeksNb(-1, 2024)).toThrow();
    });
});