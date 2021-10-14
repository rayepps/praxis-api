import _ from 'radash'
import { useState } from 'react'
import * as t from 'src/types'
import { Stack, Split } from 'src/components/Layout'
import { US_STATES } from 'src/const'
import { HiX } from 'react-icons/hi'
import addDays from 'date-fns/addDays'
import getDate from 'date-fns/getDate'
import getMonth from 'date-fns/getMonth'
import getYear from 'date-fns/getYear'
import {
  Pane,
  Heading,
  Checkbox,
  SelectMenu,
  Button,
  IconButton,
  RadioGroup,
  majorScale
} from 'evergreen-ui'
import DatePicker, { DayValue } from 'react-modern-calendar-datepicker'



export default function SearchForm({
  filters,
  tags,
  companies,
  onFiltersChange
}: {
  filters: t.SearchFilters
  tags: t.Tag[]
  companies: t.Company[]
  onFiltersChange: (arg: t.SearchFilters) => void
}) {

  const [from, setFrom] = useState<DayValue | null>(null)

  const setType = (type: t.TrainingType) => onFiltersChange({
    ...filters,
    type: type
  })

  const clearType = () => onFiltersChange({
    ...filters,
    type: undefined
  })

  const updateCompany = (companyId: string) => {
    onFiltersChange({
      ...filters,
      company: companyId
    })
  }

  const clearCompany = () => {
    onFiltersChange({
      ...filters,
      company: undefined
    })
  }

  const updateState = (state: string) => {
    onFiltersChange({
      ...filters,
      state
    })
  }

  const clearState = () => {
    onFiltersChange({
      ...filters,
      state: undefined
    })
  }

  const removeTag = (tag: t.Tag) => {
    const newTags = filters.tags?.filter(slug => slug !== tag.slug) ?? []
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const addTag = (tagSlug: string) => {
    onFiltersChange({
      ...filters,
      tags: _.unique([...(filters.tags ?? []), tagSlug])
    })
  }

  const handleDateRadio = (dateType: 'anytime' | 'this-month' | 'next-month' | 'custom') => {
    switch (dateType) {
      case 'anytime':
        onFiltersChange({
          ...filters,
          dates: undefined
        })
        return
      case 'this-month':
      case 'next-month':
        onFiltersChange({
          ...filters,
          dates: {
            preset: dateType
          }
        })
        return
      case 'custom':
        onFiltersChange({
          ...filters,
          dates: {
            preset: 'custom',
            startsAfter: new Date().toISOString(),
            endsBefore: addDays(new Date(), 15).toISOString()
          }
        })
    }
  }

  const updateCustomDateRange = (range: { from: DayValue, to: DayValue }) => {
    if (range.from && !range.to) {
      setFrom(range.from)
      return
    }
    if (!range.from || !range.to) {
      return
    }
    setFrom(null)
    onFiltersChange({
      ...filters,
      dates: {
        preset: 'custom',
        startsAfter: new Date(range.from.year, range.from.month, range.from.day).toISOString(),
        endsBefore: new Date(range.to.year, range.to.month, range.to.day).toISOString(),
      }
    })
  }

  const startsAfter = filters.dates?.startsAfter
    ? new Date(filters.dates.startsAfter)
    : new Date()

  const endsBefore = filters.dates?.endsBefore
    ? new Date(filters.dates.endsBefore)
    : new Date()

  return (
    <Stack
      width={300}
      padding={majorScale(4)}
    >
      {/* TYPE */}
      <Pane marginBottom={majorScale(2)}>
        <Heading marginBottom={majorScale(1)}>Type</Heading>
        <Checkbox
          label="Tactical"
          checked={filters.type === 'tactical'}
          onChange={(e) => e.target.checked ? setType('tactical') : clearType()}
        />
        <Checkbox
          label="Survival"
          checked={filters.type === 'survival'}
          onChange={(e) => e.target.checked ? setType('survival') : clearType()}
        />
        <Checkbox
          label="Medical"
          checked={filters.type === 'medical'}
          onChange={(e) => e.target.checked ? setType('medical') : clearType()}
        />
      </Pane>
      {/* COMPANY */}
      <Pane marginBottom={majorScale(2)}>
        <Heading marginBottom={majorScale(1)}>Company</Heading>
        <Split>
          <SelectMenu
            title="Company"
            options={companies.map(c => ({ label: c.name, value: c.slug }))}
            selected={filters.company}
            filterPlaceholder="Choose company"
            onSelect={(item) => updateCompany(item.value as string)}
          >
            <Button
              flex={1}
              marginRight={majorScale(1)}
            >
              {filters.company ? companies.find(c => c.slug === filters.company)?.name : 'Select company'}
            </Button>
          </SelectMenu>
          <IconButton
            disabled={!filters.company}
            icon={HiX}
            onClick={clearCompany}
          />
        </Split>
      </Pane>
      {/* STATE */}
      <Pane marginBottom={majorScale(2)}>
        <Heading marginBottom={majorScale(1)}>State</Heading>
        <Split>
          <SelectMenu
            title="State"
            options={Object.keys(US_STATES).map((state) => ({ label: state, value: state }))}
            selected={filters.state}
            filterPlaceholder="Choose state"
            onSelect={(item) => updateState(item.value as string)}
          >
            <Button 
              flex={1} 
              marginRight={majorScale(1)}
            >
              {filters.state || 'Select state'}
            </Button>
          </SelectMenu>
          <IconButton disabled={!filters.state} icon={HiX} onClick={clearState} />
        </Split>
      </Pane>
      {/* DATES */}
      <Pane marginBottom={majorScale(2)}>
        <Heading marginBottom={majorScale(1)}>Dates</Heading>
        <RadioGroup
          value={filters.dates?.preset ?? 'anytime'}
          options={[
            { label: 'Anytime', value: 'anytime' },
            { label: 'This month', value: 'this-month' },
            { label: 'Next month', value: 'next-month' },
            { label: 'Custom', value: 'custom' }
          ]}
          onChange={event => handleDateRadio(event.target.value as any)}
        />
        {/* Add hidden/popover date picker */}
        <Pane visibility={filters.dates?.preset === 'custom' ? 'visible' : 'hidden'}>
          <DatePicker
            value={{
              from: from ?? {
                year: getYear(startsAfter),
                month: getMonth(startsAfter) + 1,
                day: getDate(startsAfter)
              },
              to: !from ? {
                year: getYear(endsBefore),
                month: getMonth(endsBefore) + 1,
                day: getDate(endsBefore)
              } : null
            }}
            onChange={(args: any) => updateCustomDateRange(args)}
            inputPlaceholder="Select a day range"
            shouldHighlightWeekends
          />
        </Pane>
      </Pane>
      {/* TAGS */}
      <Pane marginBottom={majorScale(2)}>
        <Heading marginBottom={majorScale(1)}>Tags</Heading>
        <Split>
          <SelectMenu
            title="Tags"
            options={tags.map((tag) => ({ label: tag.name, value: tag.slug }))}
            selected={filters.tags}
            filterPlaceholder="Choose tags"
            onSelect={(item) => addTag(item.value as string)}
          >
            <Button flex={1}>Select tag</Button>
          </SelectMenu>
        </Split>
      </Pane>
      <Pane>
        {filters.tags?.map(tagSlug => {
          const tag = tags.find(t => t.slug === tagSlug)
          return tag && (
            <Checkbox
              checked
              label={tag.name}
              onChange={() => removeTag(tag)}
            />
          )
        })}
      </Pane>
    </Stack>
  )
}