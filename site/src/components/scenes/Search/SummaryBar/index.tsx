import * as t from 'src/types'
import { Split } from 'src/components/Layout'
import {
  Text,
  Pane,
  Select,
  minorScale,
  majorScale
} from 'evergreen-ui'


export default function SummaryBar({
  total,
  pageNumber,
  pageSize,
  orderBy,
  orderAs,
  onOrderChange
}: {
  total: number
  pageNumber: number
  pageSize: number
  orderBy: t.OrderBy
  orderAs: t.OrderAs
  onOrderChange: (orderBy: t.OrderBy, orderAs: t.OrderAs) => void
}) {
  const onChange = (key: string) => {
    const [by, as] = key.split('-') as [t.OrderBy, t.OrderAs]
    onOrderChange(by, as)
  }
  const options: { label: string, value: string }[] = [
    { label: 'Date - Today First', value: 'date-asc' },
    { label: 'Date - Today Last', value: 'date-desc' },
    { label: 'Price - Lowest First', value: 'price-asc' },
    { label: 'Price - Lowest Last', value: 'price-desc' },
  ]
  const value = `${orderBy}-${orderAs}`
  const start = (pageNumber - 1) * pageSize
  return (
    <Split
      paddingTop={majorScale(4)}
    >
      <Pane flex={1} display='flex' alignItems='center'>
        <Text fontWeight='bold' marginRight={minorScale(2)}>Results:</Text>
        <Text>{start}-{Math.min(start + pageSize, total)} of {total}</Text>
      </Pane>
      <Pane>
        <Text fontWeight='bold' marginRight={minorScale(2)}>Sort:</Text>
        <Select value={value} onChange={e => onChange(e.target.value)}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Pane>
    </Split>
  )
}