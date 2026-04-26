import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore } from '../../src/store/useSystemStore';

const DEFAULT_EVENTS = [
  { id: 'nfp', title: 'NFP Release', date: 'Fri 20:30', impact: 'High' },
  { id: 'cpi', title: 'US CPI', date: 'Tue 20:30', impact: 'High' },
  { id: 'retail', title: 'Retail Sales', date: 'Thu 20:30', impact: 'Medium' },
  { id: 'fomc', title: 'FOMC Statement', date: 'Wed 02:00', impact: 'High' },
];

export default function NewsScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const preparedNewsEvents = useSystemStore((s) => s.preparedNewsEvents);
  const togglePreparedNewsEvent = useSystemStore((s) => s.togglePreparedNewsEvent);
  
  const [events, setEvents] = React.useState<{id: string, title: string, date: string, impact?: string}[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.xml');
        const text = await res.text();
        const parsed = [];
        const eventRegex = /<event>([\s\S]*?)<\/event>/g;
        let match;
        while ((match = eventRegex.exec(text)) !== null) {
          const eventText = match[1];
          const title = eventText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || eventText.match(/<title>(.*?)<\/title>/)?.[1];
          const country = eventText.match(/<country>(.*?)<\/country>/)?.[1];
          const date = eventText.match(/<date><!\[CDATA\[(.*?)\]\]><\/date>/)?.[1] || eventText.match(/<date>(.*?)<\/date>/)?.[1];
          const time = eventText.match(/<time><!\[CDATA\[(.*?)\]\]><\/time>/)?.[1] || eventText.match(/<time>(.*?)<\/time>/)?.[1];
          const impact = eventText.match(/<impact><!\[CDATA\[(.*?)\]\]><\/impact>/)?.[1] || eventText.match(/<impact>(.*?)<\/impact>/)?.[1];
          
          if (title && date && country === 'USD' && (impact === 'High' || impact === 'Medium')) {
            const d = new Date(date);
            const formattedDate = isNaN(d.getTime()) 
              ? date 
              : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            parsed.push({
              id: `${title}-${date}-${time}`.replace(/\s+/g, '-'),
              title: title,
              date: `${formattedDate} ${time !== 'All Day' ? time : ''}`.trim(),
              impact: impact
            });
          }
        }
        if (parsed.length > 0) {
          setEvents(parsed);
        } else {
          setEvents(DEFAULT_EVENTS);
        }
      } catch (err) {
        setEvents(DEFAULT_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.text }]}>News</Text>
          <Text style={[styles.sub, { color: C.textMut }]}>Mark prepared events to gain +50 PER XP.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: C.textMut, fontFamily: F.medium }}>Loading latest news...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: C.textMut, fontFamily: F.medium }}>No major news events this week.</Text>
            </View>
          ) : (
            events.map((event, i) => {
              const prepared = preparedNewsEvents.find((e) => e.id === event.id)?.prepared ?? false;
              return (
                <View key={event.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: C.text }]}>{event.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Text style={[styles.rowSub, { color: C.textMut, marginTop: 0 }]}>{event.date}</Text>
                      {event.impact && (
                        <View style={{ backgroundColor: event.impact === 'High' ? C.penalty + '30' : C.warning + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 10, fontFamily: F.medium, color: event.impact === 'High' ? C.penalty : C.warning }}>{event.impact}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                <Pressable
                  style={[styles.btn, { backgroundColor: prepared ? C.surface2 : accent }]}
                  onPress={() => togglePreparedNewsEvent({ id: event.id, title: event.title, date: event.date })}
                >
                  <Text style={[styles.btnText, { color: prepared ? C.textMut : C.void }]}>
                    {prepared ? 'Prepared' : 'Mark Prepared'}
                  </Text>
                </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  sub: { fontFamily: F.regular, fontSize: 13 },
  card: { marginHorizontal: 20, marginTop: 18, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  rowTitle: { fontFamily: F.medium, fontSize: 14 },
  rowSub: { fontFamily: F.regular, fontSize: 12, marginTop: 2 },
  btn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  btnText: { fontFamily: F.semiBold, fontSize: 11 },
});
