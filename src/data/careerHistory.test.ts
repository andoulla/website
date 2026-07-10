describe('careerHistory', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('./careerHistory.json');
  });

  test('throws when an event has an unrecognised type', async () => {
    jest.doMock('./careerHistory.json', () => [
      {
        id: 'bad-event',
        type: 'internship',
        companyName: 'Acme',
        location: 'Remote',
        startDate: '2020-01-01',
        endDate: null,
        responsibilities: [],
      },
    ]);

    await expect(import('./careerHistory')).rejects.toThrow(
      'careerHistory.json: unrecognised type "internship" on event "bad-event"'
    );
  });
});
