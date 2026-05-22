import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { MOCK_COURSES, MOCK_TESTS } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const DIFF_CONFIG = {
  beginner: { label: 'Начинающий', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  intermediate: { label: 'Средний', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  advanced: { label: 'Продвинутый', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export default function AcademyPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'courses' | 'tests'>('courses');

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-4 text-purple-300 text-sm">
            <Icon name="GraduationCap" size={14} />
            Академия
          </div>
          <h1 className="font-oswald text-5xl font-bold text-white mb-3">Академия Yakudza</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Курсы, тесты и обучающие материалы для роста каждого бойца клана
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-0">
          {([['courses', 'Курсы', 'BookOpen'], ['tests', 'Тесты', 'ClipboardCheck']] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === key
                  ? 'text-purple-300 border-purple-500'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Courses */}
        {tab === 'courses' && (
          <div className="grid md:grid-cols-2 gap-4">
            {MOCK_COURSES.map((course) => {
              const diffCfg = DIFF_CONFIG[course.difficulty];
              return (
                <div key={course.id} className="card-glass rounded-xl p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {course.completed && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Icon name="CheckCircle2" size={13} />
                          Пройден
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${diffCfg.color}`}>
                        {diffCfg.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-oswald font-bold text-lg text-white mb-1">{course.title}</h3>
                    <p className="text-muted-foreground text-sm">{course.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="BookOpen" size={13} />
                      {course.lessons} уроков
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={13} />
                      {course.duration}
                    </span>
                  </div>

                  {isAuthenticated ? (
                    <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      course.completed
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        : 'bg-purple-600/20 text-purple-300 border border-purple-600/30 hover:bg-purple-600/30'
                    }`}>
                      {course.completed ? 'Повторить курс' : 'Начать курс'}
                    </button>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-2">
                      Войдите для прохождения
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tests */}
        {tab === 'tests' && (
          <div className="space-y-4">
            {MOCK_TESTS.map((test) => (
              <div key={test.id} className="card-glass rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {test.completed && (
                        <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          <Icon name="CheckCircle2" size={12} />
                          Пройден
                        </span>
                      )}
                      {test.score !== undefined && (
                        <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          Результат: {test.score}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-oswald font-bold text-lg text-white mb-1">{test.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{test.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="HelpCircle" size={13} />
                        {test.questions} вопросов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={13} />
                        {test.timeLimit} мин
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Target" size={13} />
                        Проходной балл: {test.passingScore}%
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <button className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                      test.completed
                        ? 'bg-white/5 text-muted-foreground border border-border hover:bg-white/10'
                        : 'bg-purple-600/20 text-purple-300 border border-purple-600/30 hover:bg-purple-600/30'
                    }`}>
                      {test.completed ? 'Пройти снова' : 'Начать тест'}
                    </button>
                  )}
                </div>

                {test.score !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Результат</span>
                      <span>{test.score}% / {test.passingScore}% проходной</span>
                    </div>
                    <div className="h-1.5 bg-card rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${test.score >= test.passingScore ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${test.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
