# Example prompts

Each prompt with the tools an assistant typically calls. IDs come from earlier calls: `carpool_id` from `list_carpools`, `event_id` and `kid_id` from `get_week`.

## Reading the week (`schedule` scope)

**"What does the carpool look like this week?"**
`list_carpools` → `get_week { carpool_id }`

**"Which rides am I driving?"**
`my_upcoming_rides`

**"When do I need to leave for Thursday's pick-up?"**
`my_upcoming_rides` → `get_drive_plan { event_id, slot: "pick_up" }`
Returns the leave time, pickup order with addresses, and which kids aren't riding.

**"Is anyone still needed for Saturday's game?"**
`get_week { carpool_id }`, then look for open `drop_off` / `pick_up` slots. A slot nobody rides on shows as not needed.

## Kids in or out (`rides` scope)

**"Mia is sick Wednesday."**
`get_week` → `set_kid_going { event_id, kid_id, ride: "not_going" }`

**"Theo has a ride home from Grandma on Friday."**
`set_kid_going { event_id, kid_id, ride: "there_only" }`
Only the pick-up driver is told. If no kid is left on that ride, the driver is told nobody needs it now.

**"Ava's mom is dropping her off, she just needs a ride home."**
`set_kid_going { event_id, kid_id, ride: "home_only" }`

## Driving (`rides` scope)

**"I'll take the pick-up on Thursday."**
`claim_ride { event_id, slot: "pick_up" }`

**"I'll do the whole day Saturday."**
`claim_ride { event_id, slot: "both" }`

**"I can't drive Tuesday anymore."**
`give_back_ride { event_id, slot: "drop_off" }`

**"I'm leaving now."**
`on_my_way { event_id, slot }`

**"I'm outside the Patels'."**
`here_at_stop { event_id, slot, kid_id }`

**"Everyone's home."**
`finish_ride { event_id, slot: "pick_up" }`

## Chat (`chat` scope)

**"Tell the carpool I'm running five minutes late."**
`post_chat { carpool_id, text }`

**"Anything new in the carpool chat?"**
`read_chat { carpool_id }`

## Notifications (`settings` scope)

**"Stop emailing me about chat messages."**
`get_communication_preferences` → `set_communication_preference { alert, email: false }`
