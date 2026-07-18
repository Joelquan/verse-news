/**
 * Life Desk — Christian perspective on everyday issues.
 * Niches are the discovery map; posts use the same story schema as Verse News.
 */

export const LIFE_NICHES = [
  { key: 'faith', label: 'Faith & Prayer', emoji: '🙏', blurb: 'Walking with God when the week is full and the heart is thin.' },
  { key: 'marriage', label: 'Marriage', emoji: '💍', blurb: 'Covenant love under pressure — forgiveness, habits, and hope.' },
  { key: 'parenting', label: 'Parenting', emoji: '👨‍👩‍👧', blurb: 'Raising children with truth, patience, and a long view of grace.' },
  { key: 'singleness', label: 'Singleness', emoji: '🌿', blurb: 'Wholeness, desire, community, and purpose without waiting to begin life.' },
  { key: 'work', label: 'Work & Calling', emoji: '🛠️', blurb: 'Monday morning faith — excellence, rest, and vocation under God.' },
  { key: 'money', label: 'Money & Generosity', emoji: '💰', blurb: 'Stewardship, contentment, debt, and open hands.' },
  { key: 'anxiety', label: 'Anxiety & Mind', emoji: '🧠', blurb: 'Fear, overwhelm, and the God who meets us in the storm of thought.' },
  { key: 'grief', label: 'Grief & Suffering', emoji: '🕯️', blurb: 'Lament, comfort, and honesty when loss will not hurry.' },
  { key: 'forgiveness', label: 'Forgiveness & Conflict', emoji: '🤝', blurb: 'Hard relationships, soft hearts, and the long road of peace.' },
  { key: 'identity', label: 'Identity & Purpose', emoji: '🪞', blurb: 'Who you are in Christ when culture hands you a thousand names.' },
  { key: 'friendship', label: 'Friendship & Church', emoji: '👥', blurb: 'Belonging, loneliness, and life together in the body of Christ.' },
  { key: 'youth', label: 'Youth & Students', emoji: '📚', blurb: 'School, calling, peer pressure, and roots that outlast a season.' },
  { key: 'men', label: 'Men', emoji: '⚔️', blurb: 'Strength, responsibility, purity, and quiet faithfulness.' },
  { key: 'women', label: 'Women', emoji: '🌸', blurb: 'Dignity, wisdom, calling, and courage in every season.' },
  { key: 'leadership', label: 'Leadership & Ministry', emoji: '🧭', blurb: 'Serving without burning out — character before platform.' },
  { key: 'tech', label: 'Tech & Media', emoji: '📱', blurb: 'Screens, attention, truth, and wise presence online.' },
  { key: 'health', label: 'Health & Body', emoji: '💚', blurb: 'Stewarding the body without worshiping image or ignoring limits.' },
  { key: 'culture', label: 'Culture & Public Life', emoji: '🌍', blurb: 'Witness, civility, and conviction in a noisy world.' },
  { key: 'rest', label: 'Rest & Sabbath', emoji: '🌙', blurb: 'Stopping on purpose — sleep, margin, and trust that God works while we rest.' },
  { key: 'aging', label: 'Aging & Seasons', emoji: '⏳', blurb: 'Midlife, elder years, legacy, and finishing well.' },
]

function nicheMeta(key) {
  return LIFE_NICHES.find((n) => n.key === key) || { key, label: key, emoji: '✝️' }
}

/** Build a life-desk story row */
function lifePost({
  id,
  niche,
  headline,
  summary,
  body,
  verseRef,
  verseText,
  sources = [],
  voices = [],
  tag = 'LIFE',
}) {
  const n = nicheMeta(niche)
  return {
    id,
    book: niche,
    division: 'life',
    testament: 'life',
    contentType: 'GUIDANCE',
    movement: n.label,
    movementRange: 'Life Desk',
    emoji: n.emoji,
    tag,
    location: 'Life Desk',
    dateline: 'Christian living',
    headline,
    summary,
    ref: verseRef,
    anchorVerse: verseRef && verseText ? { verse: verseRef, text: verseText } : null,
    body,
    scripture: sources.length
      ? sources
      : verseRef && verseText
        ? [{ verse: verseRef, text: verseText }]
        : [],
    commentary: voices,
    image_url: null,
    isLifeBlog: true,
    niche,
    nicheLabel: n.label,
  }
}

/**
 * Seed library — expand anytime. Everyday issues, Scripture-rooted, pastoral tone.
 * IDs 500+ avoid collision with Scripture / Creation story ids.
 */
export const LIFE_BLOGS = [
  lifePost({
    id: 500,
    niche: 'faith',
    headline: 'When Prayer Feels Empty — Keep Showing Up Anyway',
    summary: 'Dry seasons are not proof that God left. They are often the place where faithfulness is trained without the reward of feeling.',
    verseRef: 'Psalm 42:1–2',
    verseText: 'As a deer pants for flowing streams, so pants my soul for you, O God. My soul thirsts for God, for the living God.',
    body: [
      'Many sincere Christians hit weeks when prayer feels like talking into a quiet room. That does not automatically mean you have failed, and it does not mean God is absent. Scripture is full of honest thirst — not only mountaintop joy.',
      'Feeling is a gift, not a requirement for obedience. Keep a simple pattern: short daily Scripture, honest prayer (including “I feel nothing”), and one act of love. Dryness often lifts while you are still walking, not while you are waiting to feel ready.',
      'If emptiness comes with despair, prolonged numbness, or inability to function, talk with a trusted pastor and consider wise professional help. Seeking help is not a lack of faith; it is stewardship of the mind God gave you.',
    ],
    voices: [
      { author: 'Life Desk', era: 'Guidance', text: 'Faithfulness is often quieter than emotion. God hears the weak prayer as surely as the eloquent one.' },
    ],
  }),
  lifePost({
    id: 501,
    niche: 'faith',
    headline: 'How to Read the Bible When You Are Tired and Busy',
    summary: 'You do not need a seminary morning to meet God in Scripture. You need a plan small enough to keep and rich enough to feed you.',
    verseRef: 'Matthew 4:4',
    verseText: 'Man shall not live by bread alone, but by every word that comes from the mouth of God.',
    body: [
      'All-or-nothing reading plans collapse under real life. Better: ten focused minutes than an hour you never start. Choose one book (start with Mark or Philippians), read a short passage, write one sentence of response, and pray it back.',
      'Ask three questions: What does this show about God? About people? What is one obedient step today? That keeps Bible reading from becoming trivia.',
      'Join a church that opens the Bible in public worship and small groups. Private reading thrives when it is reinforced by a people who also listen.',
    ],
  }),
  lifePost({
    id: 502,
    niche: 'marriage',
    headline: 'Repair After a Hard Fight — Before You “Move On”',
    summary: 'Covenant love does not pretend conflict never happened. It practices confession, clarity, and reconnection.',
    verseRef: 'Ephesians 4:26–27',
    verseText: 'Be angry and do not sin; do not let the sun go down on your anger, and give no opportunity to the devil.',
    body: [
      'Many couples resume logistics after a fight without repairing trust. That stores resentment. Repair means naming your part without a courtroom defense, listening for the wound under the words, and agreeing on one concrete change.',
      'Anger can be a signal; contempt is a solvent. Watch for eye-rolling, scorekeeping, and public shaming. Those patterns need repentance and often outside counsel.',
      'Pray together even when it is awkward. Shared prayer is not magic — it reorients both hearts under the same Lord.',
    ],
  }),
  lifePost({
    id: 503,
    niche: 'marriage',
    headline: 'Date Nights Are Not Shallow — They Are Maintenance',
    summary: 'Friendship in marriage needs scheduled oxygen. Romance is not a personality type; it is a practiced priority.',
    verseRef: 'Song of Songs 2:15',
    verseText: 'Catch the foxes for us, the little foxes that spoil the vineyards, for our vineyards are in blossom.',
    body: [
      'Little foxes are often little neglects: phones at dinner, no unhurried talk, no shared fun. A regular, phone-light evening protects the vineyard before crisis.',
      'If budget or childcare is tight, trade with another couple, walk after kids sleep, or keep a simple “question jar.” Consistency beats spectacle.',
      'Protect purity of attention. Your spouse should not compete with a screen for the best of your mind.',
    ],
  }),
  lifePost({
    id: 504,
    niche: 'parenting',
    headline: 'Discipline That Forms Character Without Crushing the Spirit',
    summary: 'Christian parenting aims at the heart — not mere control, not passive permissiveness.',
    verseRef: 'Ephesians 6:4',
    verseText: 'Fathers, do not provoke your children to anger, but bring them up in the discipline and instruction of the Lord.',
    body: [
      'Children need clear boundaries and warm presence. Harshness without affection hardens; affection without boundaries confuses. Aim for calm consistency more than dramatic punishments.',
      'Connect consequences to reality when you can: broken trust means rebuilt trust over time. Always return to relationship — the gospel pattern of discipline and restoration.',
      'Your example preaches louder than lectures. Confession when you sin against your child is powerful discipleship.',
    ],
  }),
  lifePost({
    id: 505,
    niche: 'parenting',
    headline: 'Screens, Kids, and the Battle for Attention',
    summary: 'Technology is a tool. Unformed desire plus unlimited access is a trap. Parents set the weather of the home.',
    verseRef: 'Proverbs 4:23',
    verseText: 'Keep your heart with all vigilance, for from it flow the springs of life.',
    body: [
      'Decide house rules before devices multiply: where screens live, when they sleep, what is off-limits, and how you will check. Rules without relationship breed secrecy; relationship without rules breeds drift.',
      'Offer better goods — outdoor time, books, shared meals, church friends. It is hard to say no to a vacuum.',
      'Model the standard. Children notice if parents doomscroll through dinner.',
    ],
  }),
  lifePost({
    id: 506,
    niche: 'singleness',
    headline: 'You Are Not on Pause Until Marriage',
    summary: 'Singleness in Christ is not a waiting room. It is a real season of belonging, service, and holiness.',
    verseRef: '1 Corinthians 7:17',
    verseText: 'Only let each person lead the life that the Lord has assigned to him, and to which God has called him.',
    body: [
      'Churches sometimes treat singles as incomplete. Scripture does not. Jesus and Paul honored devoted singleness. Your worth is not pending a ring.',
      'Build a thick life: friendship, service, skill, rest, and spiritual habits. Loneliness is real — name it, and pursue community without shame.',
      'If you desire marriage, pursue wisdom and purity without making an idol of the desire. If you are content single, that too can be a gift — received, not apologized for.',
    ],
  }),
  lifePost({
    id: 507,
    niche: 'work',
    headline: 'Your Job Is Not Your Identity — But It Is Your Worship Arena',
    summary: 'Work matters to God. It does not save you, define you, or own your Sabbath.',
    verseRef: 'Colossians 3:23–24',
    verseText: 'Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward.',
    body: [
      'Christians reject both laziness and work-as-god. Show up with integrity: tell the truth, finish what you start, refuse gossip, honor authority without idolizing bosses.',
      'When work is unjust or crushing, wisdom may include boundaries, advocacy, or change. Endurance is not the same as enabling abuse.',
      'Offer your week to God on Sunday night or Monday morning in prayer. Ordinary labor becomes spiritual when done unto Christ.',
    ],
  }),
  lifePost({
    id: 508,
    niche: 'work',
    headline: 'When You Hate Your Job — Faithfulness Before Fantasy',
    summary: 'Discontent can be a call to change or a call to grow. Discernment needs prayer, counsel, and honesty about motives.',
    verseRef: 'Psalm 90:17',
    verseText: 'Let the favor of the Lord our God be upon us, and establish the work of our hands upon us.',
    body: [
      'List what is sinful (bitterness, envy), what is hard but normal, and what is truly toxic. Those categories need different responses.',
      'Seek counsel from mature believers who know you. Update skills if needed. Do not burn bridges in the name of “being authentic.”',
      'Until you leave, do excellent work. Your witness is on display in the exit as much as in the stay.',
    ],
  }),
  lifePost({
    id: 509,
    niche: 'money',
    headline: 'A Simple Christian Budget: Margin, Generosity, Honesty',
    summary: 'Money reveals worship. A plan is not unspiritual — it is how love becomes practical.',
    verseRef: 'Proverbs 27:23–24',
    verseText: 'Know well the condition of your flocks, and give attention to your herds, for riches do not last forever.',
    body: [
      'Track what comes in and what goes out for thirty days without judgment. Then assign every dollar: give, save, needs, wants. Start generosity even small — open hands train the heart.',
      'Attack high-interest debt with a clear order. Avoid shame spirals; replace them with next steps.',
      'Talk money in marriage and trusted community. Secrecy feeds both greed and fear.',
    ],
  }),
  lifePost({
    id: 510,
    niche: 'money',
    headline: 'Contentment Is a Skill — Not a Personality Trait',
    summary: 'Advertising disciples us toward more. Christ disciples us toward enough.',
    verseRef: '1 Timothy 6:6–8',
    verseText: 'Godliness with contentment is great gain, for we brought nothing into the world, and we cannot take anything out of the world.',
    body: [
      'Practice gratitude out loud. Limit lifestyle comparison on social media. Celebrate others’ gains without rewriting your story as failure.',
      'Contentment is not apathy about injustice or poverty. It is freedom from the lie that your next purchase will finally make you whole.',
      'Generosity is contentment’s gym. Give until it rearranges your priorities.',
    ],
  }),
  lifePost({
    id: 511,
    niche: 'anxiety',
    headline: 'Anxious Thoughts and the God Who Holds Tomorrow',
    summary: 'Anxiety is not always unbelief — and unbelief is not healed by scolding. Bring the body and the soul to God together.',
    verseRef: 'Philippians 4:6–7',
    verseText: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.',
    body: [
      'Pray specifically, not vaguely. Write fears down. Counter them with what is true, lovely, and promised — not with toxic positivity.',
      'Care for the body: sleep, movement, medical care when needed. God made you embodied; spiritualizing every symptom can be unwise.',
      'If anxiety is severe or persistent, wise counseling and medical evaluation can be means of grace. Church community should walk with you, not shame you.',
    ],
  }),
  lifePost({
    id: 512,
    niche: 'grief',
    headline: 'Lament Is Christian — Silence Is Not the Only Faithful Option',
    summary: 'The Psalms teach us to cry loudly to God without editing our pain into false cheer.',
    verseRef: 'Psalm 34:18',
    verseText: 'The Lord is near to the brokenhearted and saves the crushed in spirit.',
    body: [
      'Grief has no stopwatch. Well-meaning people may rush you; God does not. Keep simple rituals of remembrance and prayer.',
      'Let the church carry practical weight: meals, childcare, presence. Suffering is not a solo sport in the body of Christ.',
      'Hope of resurrection does not cancel tears. It anchors them. Jesus wept at a tomb he would soon empty.',
    ],
  }),
  lifePost({
    id: 513,
    niche: 'forgiveness',
    headline: 'Forgiveness Is Not Pretending It Did Not Happen',
    summary: 'Biblical forgiveness releases vengeance to God. It does not always erase consequences or require immediate trust.',
    verseRef: 'Colossians 3:13',
    verseText: 'As the Lord has forgiven you, so you also must forgive.',
    body: [
      'Forgiveness is a decision empowered by the gospel, often repeated as feelings return. It refuses to keep a record for revenge.',
      'Reconciliation may require repentance, time, and boundaries — especially where abuse or ongoing harm exists. Safety matters. Seek wise help.',
      'Bitterness is a high-interest debt you pay to yourself. Bring it to the cross in prayer and, when wise, in conversation.',
    ],
  }),
  lifePost({
    id: 514,
    niche: 'identity',
    headline: 'You Are Not Your Worst Day or Your Best Highlight Reel',
    summary: 'In Christ, identity is received before it is achieved.',
    verseRef: '1 John 3:1',
    verseText: 'See what kind of love the Father has given to us, that we should be called children of God; and so we are.',
    body: [
      'Culture offers identity as performance, tribe, or desire. The gospel offers adoption. That steadies you when roles change — job, status, health, relationship.',
      'Confess sin without collapsing into shame. Shame says “I am the failure.” Repentance says “I did wrong — and Christ is enough.”',
      'Practice belonging: baptism, church membership, shared table. Identity grows in community, not only in mirrors.',
    ],
  }),
  lifePost({
    id: 515,
    niche: 'friendship',
    headline: 'Church Loneliness Is Real — And It Can Heal',
    summary: 'Showing up is step one. Being known is step two. Both require courage.',
    verseRef: 'Romans 12:10',
    verseText: 'Love one another with brotherly affection. Outdo one another in showing honor.',
    body: [
      'Large services can feel anonymous. Join a smaller room: group, class, serving team. Consistency beats intensity.',
      'Initiate. Invite someone for coffee. Text on people after hard Sundays. Friendship is often built by the person willing to go first.',
      'If church hurt you, do not walk alone forever. Seek a healthy congregation and wise counseling when wounds are deep.',
    ],
  }),
  lifePost({
    id: 516,
    niche: 'youth',
    headline: 'Pressure, Grades, and the God Who Sees You',
    summary: 'Your worth is not a GPA. Excellence can be worship; fear of man cannot.',
    verseRef: 'Colossians 3:17',
    verseText: 'Whatever you do, in word or deed, do everything in the name of the Lord Jesus.',
    body: [
      'Work hard without treating anxiety as fuel. Build rhythms of study, sleep, worship, and friendship.',
      'Choose companions who make obedience easier, not harder. Peer pressure is real discipleship — someone is always forming you.',
      'Talk to trusted adults early about crushing stress. Asking for help is strength.',
    ],
  }),
  lifePost({
    id: 517,
    niche: 'men',
    headline: 'Strength That Protects — Not Strength That Dominates',
    summary: 'Christian manhood looks like responsibility, purity, courage, and sacrificial love — not swagger.',
    verseRef: '1 Corinthians 16:13–14',
    verseText: 'Be watchful, stand firm in the faith, act like men, be strong. Let all that you do be done in love.',
    body: [
      'Own your spiritual temperature. Lead in prayer at home if you have a household. Seek brothers who confess sin and pursue holiness together.',
      'Treat women as sisters, not objects. Purity is not prudishness; it is love refusing to consume.',
      'Ambition is fine; neglect of family and church is not. Measure success by faithfulness where God placed you.',
    ],
  }),
  lifePost({
    id: 518,
    niche: 'women',
    headline: 'Called, Capable, and Not Alone',
    summary: 'Scripture dignifies women as image-bearers, disciples, and essential members of the church’s mission.',
    verseRef: 'Proverbs 31:25',
    verseText: 'Strength and dignity are her clothing, and she laughs at the time to come.',
    body: [
      'Your calling may include home, workplace, ministry, or all three across seasons. Seek God’s Word and wise community more than internet archetypes.',
      'Reject both demeaning stereotypes and a gospel of self that has no cross. Christ defines your worth.',
      'Build friendships that tell the truth in love. Isolation is a quiet enemy.',
    ],
  }),
  lifePost({
    id: 519,
    niche: 'leadership',
    headline: 'Ministry Without a Meltdown — Pace for the Long Race',
    summary: 'Burnout is not a badge. Character outlasts charisma.',
    verseRef: '1 Peter 5:2–3',
    verseText: 'Shepherd the flock of God that is among you… not domineering over those in your charge, but being examples to the flock.',
    body: [
      'Build Sabbath into the calendar before crisis. No one is the Holy Spirit. Delegate and develop others.',
      'Invite accountability for pride, secrecy, and fatigue. Hidden struggles grow in leadership isolation.',
      'Measure fruit over time: disciples made, peace in the body, integrity at home — not only crowd size.',
    ],
  }),
  lifePost({
    id: 520,
    niche: 'tech',
    headline: 'Your Phone Is Discipleing Someone — Is It You?',
    summary: 'Attention is spiritual. Algorithms are not neutral pastors.',
    verseRef: 'Psalm 101:3',
    verseText: 'I will not set before my eyes anything that is worthless.',
    body: [
      'Set device-free zones: meals, bedroom, first and last minutes of the day. Turn off non-essential notifications.',
      'Curate inputs. Follow accounts that build wisdom; mute rage and envy machines. Confess porn and secrecy quickly to a trusted believer.',
      'Use tech as a tool for love — messages of encouragement, Scripture audio, serving logistics — not only consumption.',
    ],
  }),
  lifePost({
    id: 521,
    niche: 'health',
    headline: 'The Body Is a Temple — Not a Trophy and Not Trash',
    summary: 'Steward health without obsessing over image or ignoring limits.',
    verseRef: '1 Corinthians 6:19–20',
    verseText: 'Do you not know that your body is a temple of the Holy Spirit within you… So glorify God in your body.',
    body: [
      'Basic faithfulness: sleep, movement you can sustain, food that fuels rather than numbs, medical care when needed.',
      'Reject both vanity and neglect. Your body is not your god; it is a gift to serve God and neighbor.',
      'If you struggle with disordered eating, addiction, or chronic illness, seek competent help. The church should support, not simplify, complex suffering.',
    ],
  }),
  lifePost({
    id: 522,
    niche: 'culture',
    headline: 'Conviction Without Contempt in a Polarized Age',
    summary: 'Christians can tell the truth without becoming what they oppose.',
    verseRef: 'Colossians 4:5–6',
    verseText: 'Walk in wisdom toward outsiders… Let your speech always be gracious, seasoned with salt.',
    body: [
      'Hold firm convictions grounded in Scripture. Refuse to dehumanize opponents. Mockery is not the same as courage.',
      'Prioritize local faithfulness: family, church, neighbors, workplace. Not every national fight is your personal assignment.',
      'Be quick to listen, slow to share. Verify before you amplify. Witness dies when Christians become unreliable with facts.',
    ],
  }),
  lifePost({
    id: 523,
    niche: 'rest',
    headline: 'Sabbath Is Trust With Your Calendar',
    summary: 'Stopping is a confession: God runs the world, not you.',
    verseRef: 'Exodus 20:8–10',
    verseText: 'Remember the Sabbath day, to keep it holy… On it you shall not do any work.',
    body: [
      'Christians debate details of practice; the principle stands: rhythmic rest under God. Protect corporate worship and a real stop to ordinary output.',
      'Prepare for rest like you prepare for work. Unfinished tasks will always exist. Choose presence anyway.',
      'Rest is not only sleep — it is delight in God and his gifts: table, creation, friendship, silence.',
    ],
  }),
  lifePost({
    id: 524,
    niche: 'aging',
    headline: 'Finishing Well Starts Earlier Than You Think',
    summary: 'Every season can glorify God — including the ones culture ignores.',
    verseRef: 'Psalm 92:14',
    verseText: 'They still bear fruit in old age; they are ever full of sap and green.',
    body: [
      'Invest in the next generation now: prayer, presence, stories of God’s faithfulness. Legacy is people, not only projects.',
      'Plan practically — health, legal affairs, reconciliation of relationships — as acts of love.',
      'Resist despair about decline. The gospel promises resurrection. Your labor in the Lord is not in vain.',
    ],
  }),
  lifePost({
    id: 525,
    niche: 'anxiety',
    headline: 'Late-Night Spirals: A Simple Practice Before Sleep',
    summary: 'When the mind races at midnight, you need a path more than a pep talk.',
    verseRef: 'Psalm 4:8',
    verseText: 'In peace I will both lie down and sleep; for you alone, O Lord, make me dwell in safety.',
    body: [
      'Try a short sequence: breathe slowly, hand worries to God by name, read a brief psalm aloud, list three thanks, set the phone away.',
      'If sleeplessness is chronic, evaluate caffeine, screens, and medical factors. Prayer and prudence work together.',
      'Tomorrow’s mercies are not issued early — and you are not required to solve the whole week tonight.',
    ],
  }),
  lifePost({
    id: 526,
    niche: 'forgiveness',
    headline: 'Hard Conversations Without a Blowup',
    summary: 'Peace often requires a meeting, not a meme. Prepare your heart before your speech.',
    verseRef: 'Matthew 18:15',
    verseText: 'If your brother sins against you, go and tell him his fault, between you and him alone.',
    body: [
      'Aim for clarity: one issue, one example, one request. Avoid “you always.” Use “I felt / I need.”',
      'Choose timing. Hungry, exhausted, or public settings escalate. Pray for the other person’s good before you speak.',
      'If they will not listen, follow wise steps of counsel in the church. Do not recruit a gossip army.',
    ],
  }),
  lifePost({
    id: 527,
    niche: 'friendship',
    headline: 'How to Be the Kind of Friend You Wish You Had',
    summary: 'Friendship is mostly unglamorous faithfulness over time.',
    verseRef: 'Proverbs 17:17',
    verseText: 'A friend loves at all times, and a brother is born for adversity.',
    body: [
      'Show up in adversity with presence more than platitudes. Follow through on “let me know if you need anything” with a specific offer.',
      'Celebrate without envy. Keep confidences. Tell hard truth gently when love requires it.',
      'Do not demand a best-friend title overnight. Depth grows from shared worship, shared meals, and shared years.',
    ],
  }),
  lifePost({
    id: 528,
    niche: 'culture',
    headline: 'Raising Kids Who Can Think Christianly in Public School and Online',
    summary: 'You cannot bubble-wrap a generation — but you can root them.',
    verseRef: 'Deuteronomy 6:6–7',
    verseText: 'And these words that I command you today shall be on your heart. You shall teach them diligently to your children…',
    body: [
      'Talk about ideas at the table: what did you hear, what is true, what is beautiful, what is false? Curiosity is a Christian tool.',
      'Prioritize church community so peers of faith are normal, not exotic.',
      'Whether home, private, or public school, parents remain primary disciple-makers. Curriculum cannot replace that.',
    ],
  }),
  lifePost({
    id: 529,
    niche: 'rest',
    headline: 'Burnout Warning Lights Christians Ignore',
    summary: 'Exhaustion can be physical, emotional, or spiritual — and it rarely fixes itself with one more commitment.',
    verseRef: 'Mark 6:31',
    verseText: 'And he said to them, “Come away by yourselves to a desolate place and rest a while.”',
    body: [
      'Warning lights: constant irritability, numbness in worship, cynicism about people, sleepless dread, joyless service. Do not spiritualize them away.',
      'Respond with confession if pride drove you, then rearrange load. Jesus invited rest; he did not praise burnout as holiness.',
      'Ask elders or mentors for help rebalancing. Sometimes the most faithful word is no.',
    ],
  }),
]

export function getLifeBlogsByNiche(nicheKey) {
  if (!nicheKey || nicheKey === 'all') return LIFE_BLOGS
  return LIFE_BLOGS.filter((p) => p.niche === nicheKey)
}

/** Stable daily picks for homepage (rotates with calendar day) */
export function getDailyLifePicks(count = 6, now = new Date()) {
  if (!LIFE_BLOGS.length) return []
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
  const start = Math.abs(day) % LIFE_BLOGS.length
  const out = []
  for (let i = 0; i < Math.min(count, LIFE_BLOGS.length); i++) {
    out.push(LIFE_BLOGS[(start + i) % LIFE_BLOGS.length])
  }
  return out
}
