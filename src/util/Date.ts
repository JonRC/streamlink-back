import moment, { unitOfTime } from 'moment'

const diff = (
  end: Date,
  start: Date,
  unit: unitOfTime.Diff = 'milliseconds'
) => {
  const endMoment = moment(end)
  const startMoment = moment(start)
  return endMoment.diff(startMoment, unit)
}

export const DateUtil = { diff }
