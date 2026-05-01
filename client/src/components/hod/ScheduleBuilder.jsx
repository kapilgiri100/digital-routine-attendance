import { useState, useEffect, useCallback } from 'react'
import { days, getTimeOptions, generateSlots } from '../../utils/scheduleUtils.js'
import { showAlert } from '../common/Alert.jsx'
import './ScheduleBuilder.css'

export default function ScheduleBuilder({ schedule, setSchedule, teachers, subjects }) {
  const [day, setDay] = useState(days[1] || 'Monday')
  const [teacherId, setTeacherId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [slotType, setSlotType] = useState('class')
  const [loading, setLoading] = useState(false)

  // Flexible slot generation
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [slotDuration, setSlotDuration] = useState(45)
  const [availableSlots, setAvailableSlots] = useState([])

  const timeOptions = getTimeOptions()
  const durations = [15, 30, 45, 60, 75, 90]

  const generateDaySlots = useCallback(() => {
    const slots = generateSlots(startTime, endTime, slotDuration)
    if (slots.length === 0) {
      showAlert('Invalid time range or duration. Check start < end and duration > 0', 'error')
      return
    }
    setAvailableSlots(slots)
    showAlert(`Generated ${slots.length} slots (${slotDuration}min)`, 'success')
  }, [startTime, endTime, slotDuration])

  const [selectedSlot, setSelectedSlot] = useState('')

  // Load existing data when slot selected
  useEffect(() => {
    if (schedule && schedule[day] && schedule[day][selectedSlot]) {
      const slotData = schedule[day][selectedSlot]
      setTeacherId(slotData.teacherId?.toString() || '')
      setSelectedSubject(slotData.subject || '')
      setSlotType(slotData.type || 'class')
    } else {
      setTeacherId('')
      setSelectedSubject('')
      setSlotType('class')
    }
  }, [day, selectedSlot, schedule])

  const handleSave = async () => {
    if (!selectedSlot) {
      showAlert('Please generate slots and select a slot', 'error')
      return
    }

    if (slotType === 'class') {
      if (!teacherId) {
        showAlert('Please select teacher', 'error')
        return
      }
      const subject = selectedSubject
      if (!subject) {
        showAlert('Please select subject', 'error')
        return
      }

      // Validate that teacher exists
      const teacherExists = teachers && teachers.some(t => t.id === Number(teacherId))
      if (!teacherExists) {
        showAlert('Selected teacher does not exist', 'error')
        return
      }

      // Validate that subject exists
      const subjectExists = subjects && subjects.some(s => s.name === subject)
      if (!subjectExists) {
        showAlert('Selected subject does not exist', 'error')
        return
      }
    }

    const entry = slotType === 'break'
      ? { type: 'break' }
      : { teacherId: Number(teacherId), subject: selectedSubject, type: 'class' }

    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [selectedSlot]: entry
      }
    }

    setLoading(true)
    try {
      await setSchedule(newSchedule)
      showAlert('Schedule saved!', 'success')
    } catch (err) {
      showAlert(`Save failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSlot = async () => {
    const newSchedule = { ...schedule }
    delete newSchedule[day]?.[selectedSlot]
    setLoading(true)
    try {
      await setSchedule(newSchedule)
      showAlert('Slot cleared!', 'success')
      setTeacherId('')
      setSelectedSubject('')
    } catch (err) {
      showAlert('Clear failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSlot = () => {
    const newSchedule = { ...schedule }
    delete newSchedule[day]?.[selectedSlot]
    setSchedule(newSchedule)
    // Remove from availableSlots too
    setAvailableSlots(prev => prev.filter(s => s.label !== selectedSlot))
    showAlert('Slot removed from generation list!', 'success')
    setSelectedSlot('')
  }

  const handleEditSlot = () => {
    showAlert('Edit mode - regenerate with new times/duration', 'info')
  }

  return (
    <div className="schedule-builder">
      <h3>Build Schedule</h3>

      {/* Session Config */}
      <div className="session-config">
        <label>
          From:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={loading} step="900" min="06:00" max="20:00" />
        </label>
        <label>
          To:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={loading} step="900" min="06:00" max="20:00" />
        </label>
        <label>
          Duration:
          <select value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} disabled={loading}>
            {durations.map(d => <option key={d} value={d}>{d}min</option>)}
          </select>
        </label>
        <button onClick={generateDaySlots} disabled={loading} className="btn-generate">
          Generate Slots
        </button>
      </div>

      {/* Generated Slots List */}
      {availableSlots.length > 0 && (
        <div className="generated-slots">
          <div className="slots-header">
            <strong>Available Slots ({availableSlots.length}):</strong>
            <button onClick={() => setAvailableSlots([])} className="btn-clear-slots" title="Clear all generated slots">
              Clear All
            </button>
          </div>
          <div className="slot-list">
            {availableSlots.map(slot => (
              <div key={slot.label} className={`slot-option ${selectedSlot === slot.label ? 'selected' : ''}`} onClick={() => setSelectedSlot(slot.label)}>
                {slot.label}
                {selectedSlot === slot.label && (
                  <div className="slot-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEditSlot(); }} className="btn-edit-slot" title="Edit">
                      ✏️ Regenerate
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveSlot(slot.label); }} className="btn-remove-slot" title="Remove">
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Select */}
      {availableSlots.length > 0 && (
        <div className="form-row">
          <select value={day} onChange={(e) => setDay(e.target.value)} disabled={loading}>
            {days.filter(d => d !== 'Sunday').map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Teacher + Subject */}
      {selectedSlot && (
        <>
          <div className="form-row">
            <label>
              Type:
              <select value={slotType} onChange={(e) => setSlotType(e.target.value)} disabled={loading}>
                <option value="class">Class</option>
                <option value="break">Break</option>
              </select>
            </label>
          </div>
          {slotType === 'class' && (
            <div className="form-row">
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} disabled={loading}>
                <option value="">Pick teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={loading}>
                <option value="">Subject</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button onClick={handleSave} disabled={loading || !selectedSlot || (slotType === 'class' && !teacherId)} className="btn-save">
          {loading ? 'Saving...' : 'Save Slot'}
        </button>
        {selectedSlot && (
          <button onClick={handleClearSlot} disabled={loading} className="btn-clear">
            Clear Assignment
          </button>
        )}
      </div>
    </div>
  )
}

