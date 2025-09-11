import json
from datetime import datetime, timedelta

def update_calendar(hw_file, lab_file, mp_file, quiz_file, ec_file, lecture_file, calendar_file, output_schedule_file):
    # Load the existing JSON files
    def load_json(file):
        with open(file, 'r') as f:
            return json.load(f)

    # Load all files
    hw_data = load_json(hw_file)
    lab_data = load_json(lab_file)
    mp_data = load_json(mp_file)
    quiz_data = load_json(quiz_file)
    ec_data = load_json(ec_file)
    lecture_data = load_json(lecture_file)
    calendar_data = load_json(calendar_file)

    def get_event_by_date(events, event_type):
        event_dict = {}
        for event in events:
            if event['date'] not in event_dict:
                event_dict[event['date']] = {
                    f'{event_type}_topic': event['topic'],
                    f'{event_type}_link': event['link'],
                    f'{event_type}_due_topic': '',
                    f'{event_type}_due_link': ''
                }
            else:
                event_dict[event['date']][f'{event_type}_topic'] += f"{event['topic']}"
                event_dict[event['date']][f'{event_type}_link'] += f"{event['link']}"

            if 'due_date' in event:
                if event['due_date'] not in event_dict:
                    event_dict[event['due_date']] = {
                        f'{event_type}_due_topic': event['topic'],
                        f'{event_type}_due_link': event['link'],
                        f'{event_type}_topic': '',
                        f'{event_type}_link': ''
                    }
                else:
                    event_dict[event['due_date']][f'{event_type}_due_topic'] += f"{event['topic']}"
                    event_dict[event['due_date']][f'{event_type}_due_link'] += f"{event['link']}"
        return event_dict

    # Special handling for mp events with multiple due dates
    def get_mp_events_by_date(mp_events):
        event_dict = {}
        for mp in mp_events:
            event_dict[mp['date']] = {
                'mp_topic': mp['topic'],
                'mp_link': mp['link'],
                'mp_due_topic': '',
                'mp_due_link': ''
            }
            event_dict[mp['part1_due_date']] = {
                'mp_due_topic': f"{mp['topic']} Part 1",
                'mp_due_link': mp['link'],
                'mp_topic': '',
                'mp_link': ''
            }
            event_dict[mp['part2_due_date']] = {
                'mp_due_topic': f"{mp['topic']} Part 2",
                'mp_due_link': mp['link'],
                'mp_topic': '',
                'mp_link': ''
            }
            event_dict[mp['part3_due_date']] = {
                'mp_due_topic': f"{mp['topic']} Part 3",
                'mp_due_link': mp['link'],
                'mp_topic': '',
                'mp_link': ''
            }
        return event_dict

    # Special handling for quiz to populate for all days between release and due dates
    def get_quiz_events_by_date(events, event_type):
        event_dict = {}
        for event in events:
            start_date = datetime.strptime(event['date'], "%Y-%m-%d")
            due_date = datetime.strptime(event['due_date'], "%Y-%m-%d")
            delta = (due_date - start_date).days

            for i in range(delta + 1):
                current_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
                if current_date not in event_dict:
                    event_dict[current_date] = {f'{event_type}_topic': [], f'{event_type}_link': [], f'{event_type}_due_topic': [], f'{event_type}_due_link': []}
                    event_dict[current_date][f'{event_type}_topic'].append(event['topic'])
                    event_dict[current_date][f'{event_type}_link'].append(event['link'])

        return event_dict

    # Get event details for each type
    hw_events = get_event_by_date(hw_data, 'hw')
    lab_events = get_event_by_date(lab_data, 'lab')
    mp_events = get_mp_events_by_date(mp_data)
    quiz_events = get_quiz_events_by_date(quiz_data, 'quiz')
    ec_events = get_event_by_date(ec_data, 'ec')
    lecture_events = get_event_by_date(lecture_data, 'lecture')

    # Initialize the schedule list
    schedule = []

    # Iterate through the calendar and add corresponding events
    for day in calendar_data:
        date = day['date']

        # Prepare the schedule entry with default empty strings
        schedule_entry = {
            "day_idx": day['day_idx'],
            "date": date,
            "week_day": day['week_day'],
            "week_idx": day['week_idx'],
            "dayoff": day['dayoff'],
            "lecture_topic": lecture_events.get(date, {}).get('lecture_topic', ''),
            "lecture_link": lecture_events.get(date, {}).get('lecture_link', ''),
            
            "hw_topic": hw_events.get(date, {}).get('hw_topic', ''),
            "hw_link": hw_events.get(date, {}).get('hw_link', ''),
            "hw_due_topic": hw_events.get(date, {}).get('hw_due_topic', ''),
            "hw_due_link": hw_events.get(date, {}).get('hw_due_link', ''),
            
            "lab_topic": lab_events.get(date, {}).get('lab_topic', ''),
            "lab_link": lab_events.get(date, {}).get('lab_link', ''),
            "lab_due_topic": lab_events.get(date, {}).get('lab_due_topic', ''),
            "lab_due_link": lab_events.get(date, {}).get('lab_due_link', ''),
            
            "mp_topic": mp_events.get(date, {}).get('mp_topic', ''),
            "mp_link": mp_events.get(date, {}).get('mp_link', ''),
            "mp_due_topic": mp_events.get(date, {}).get('mp_due_topic', ''),
            "mp_due_link": mp_events.get(date, {}).get('mp_due_link', ''),
            
            "ec_topic": ec_events.get(date, {}).get('ec_topic', ''),
            "ec_link": ec_events.get(date, {}).get('ec_link', ''),
            "ec_due_topic": ec_events.get(date, {}).get('ec_due_topic', ''),
            "ec_due_link": ec_events.get(date, {}).get('ec_due_link', ''),
            
            "quiz_topic": quiz_events.get(date, {}).get('quiz_topic', ''),
            "quiz_link": quiz_events.get(date, {}).get('quiz_link', ''),
            "quiz_due_topic": quiz_events.get(date, {}).get('quiz_due_topic', ''),
            "quiz_due_link": quiz_events.get(date, {}).get('quiz_due_link', '')
        }

        # Add the entry to the schedule list
        schedule.append(schedule_entry)

    # Write the schedule to the output file
    with open(output_schedule_file, 'w') as out_file:
        json.dump(schedule, out_file, indent=4)

#update_calendar('public/schedule/hw.json', 'public/schedule/lab.json', 'public/schedule/mp.json', 'public/schedule/quiz.json', "public/schedule/ec.json" , 'public/schedule/lecture.json', 'public/schedule/calendar.json', 'public/schedule/schedule.json')
update_calendar('hw.json', 'lab.json', 'mp.json', 'quiz.json', 'ec.json' , 'lecture.json', 'calendar.json', 'schedule.json')