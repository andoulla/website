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

  test('throws when two responsibilities share an id across events', async () => {
    const makeEvent = (id: string) => ({
      id,
      type: 'work',
      companyName: 'Acme',
      location: 'Remote',
      startDate: '2020-01-01',
      endDate: null,
      responsibilities: [{ id: 'shared-r01', text: 'Did a thing', skillIds: [] }],
    });

    jest.doMock('./careerHistory.json', () => [makeEvent('event-1'), makeEvent('event-2')]);

    await expect(import('./careerHistory')).rejects.toThrow(
      'careerHistory.json: duplicate responsibility id "shared-r01"'
    );
  });

  test('throws when a responsibility references an unknown skillId', async () => {
    jest.doMock('./careerHistory.json', () => [
      {
        id: 'event-1',
        type: 'work',
        companyName: 'Acme',
        location: 'Remote',
        startDate: '2020-01-01',
        endDate: null,
        responsibilities: [{ id: 'event-1-r01', text: 'Did a thing', skillIds: ['not-a-skill'] }],
      },
    ]);

    await expect(import('./careerHistory')).rejects.toThrow(
      'careerHistory.json: unknown skillId "not-a-skill" on responsibility "event-1-r01"'
    );
  });
});
