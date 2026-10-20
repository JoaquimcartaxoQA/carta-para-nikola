/**
 * Nikola Race: A Grande Corrida
 * Tela da Carta do Tio Joaquim para Nikola Cartaxo ❤️
 * Agora com suporte bilingue: Versão em Português 🇧🇷 e Versão em Inglês 🇺🇸
 */

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Trophy, ArrowLeft, Globe, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../services/audio';

interface LetterModalProps {
  onBack: () => void;
}

type Language = 'pt' | 'en';

const LETTER_CONTENT = {
  pt: {
    langName: 'Português',
    flag: '🇧🇷',
    badgeTop: 'Especial para Nikola',
    subBadge: 'Mensagem com muito carinho',
    title: 'Uma cartinha para Nikola',
    origin: 'De Fortaleza para Natal com todo o amor do mundo!',
    toWhom: 'Para o meu querido Nikola! 🏎️🏁',
    greeting: 'Nikola, meu campeão!',
    p1: 'O tio te ama muuuito! ❤️ Mesmo estando longe, em Fortaleza, sinto muita saudade de você e queria poder estar mais pertinho para brincar, dar um abraço apertado e viver muitas aventuras ao seu lado.',
    p2: 'Por isso, criei esse joguinho de corrida especialmente para você! 🏎️💨 Assim, mesmo com a distância entre Natal e Fortaleza, podemos compartilhar momentos divertidos e sentir que estamos um pouquinho mais perto um do outro.',
    p3: 'Espero que você se divirta muito, meu pequeno piloto! E nunca se esqueça: não importa quantos quilômetros existam entre nós, você sempre estará pertinho do meu coração. ❤️',
    hug: 'Um abraço gigante do seu tio, que te ama demais!',
    signOff: 'Com muito amor,',
    signature: 'Tio Joaquim 🥰🏁',
    footerNote: 'Feito com amor de Tio Joaquim para Nikola Cartaxo',
    backBtn: 'Voltar ao Menu',
    readAloudBtn: 'Ouvir Carta',
    stopAudioBtn: 'Parar Áudio',
    speechLang: 'pt-BR',
    speechText:
      'Para o meu querido Nikola! Nikola, meu campeão! O tio te ama muito! Mesmo estando longe em Fortaleza, sinto muita saudade de você e queria poder estar mais pertinho para brincar, dar um abraço apertado e viver muitas aventuras ao seu lado. Por isso criei esse joguinho de corrida especialmente para você! Assim podemos compartilhar momentos divertidos e sentir que estamos pertinho. Espero que você se divirta muito, meu pequeno piloto! Um abraço gigante do seu tio Joaquim, com muito amor!',
  },
  en: {
    langName: 'English',
    flag: '🇺🇸',
    badgeTop: 'Special for Nikola',
    subBadge: 'Message filled with love',
    title: 'A letter for Nikola',
    origin: 'From Fortaleza to Natal with all the love in the world!',
    toWhom: 'To my beloved Nikola! 🏎️🏁',
    greeting: 'Nikola, my champion!',
    p1: "Your uncle loves you soo much! ❤️ Even though I'm far away in Fortaleza, I miss you dearly and wish I could be right there by your side to play, give you a giant bear hug, and go on lots of fun adventures together.",
    p2: "That's why I created this little racing game specially for you! 🏎️💨 This way, even with the distance between Natal and Fortaleza, we can share fun moments and feel like we're a little closer to each other.",
    p3: 'I hope you have tons of fun, my little racer! And never forget: no matter how many kilometers exist between us, you will always be right here in my heart. ❤️',
    hug: 'A giant hug from your uncle, who loves you endlessly!',
    signOff: 'With all my love,',
    signature: 'Uncle Joaquim 🥰🏁',
    footerNote: 'Made with love by Uncle Joaquim for Nikola Cartaxo',
    backBtn: 'Back to Menu',
    readAloudBtn: 'Listen to Letter',
    stopAudioBtn: 'Stop Audio',
    speechLang: 'en-US',
    speechText:
      'To my beloved Nikola! Nikola, my champion! Uncle loves you so much! Even though I am far away in Fortaleza, I miss you dearly and wish I could be right there by your side to play, give you a big bear hug, and go on fun adventures together. That is why I created this racing game specially for you! I hope you have tons of fun, my little racer. You will always be right here in my heart. A giant hug from your Uncle Joaquim, with all my love!',
  },
};

export const LetterModal: React.FC<LetterModalProps> = ({ onBack }) => {
  const [lang, setLang] = useState<Language>('pt');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancela qualquer fala ao desmontar o componente ou mudar de idioma
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    sound.playButton();
    onBack();
  };

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === lang) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    sound.playButton();
    setLang(newLang);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const currentData = LETTER_CONTENT[lang];
    const utterance = new SpeechSynthesisUtterance(currentData.speechText);
    utterance.lang = currentData.speechLang;
    utterance.rate = 0.92; // Ritmo mais calmo e acolhedor para crianças
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const content = LETTER_CONTENT[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50 p-5 sm:p-10 shadow-2xl border-4 border-amber-300 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorações divertidas infantis no topo */}
        <div className="absolute -top-6 -left-3 sm:-left-4 flex items-center gap-1 bg-red-500 text-white font-cartoon px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-lg border-2 border-white rotate-[-6deg]">
          <span className="text-lg sm:text-xl">🏎️</span>
          <span className="text-xs sm:text-sm font-bold">{content.badgeTop}</span>
        </div>

        <div className="absolute -top-5 -right-2 sm:-right-3 bg-amber-400 text-amber-950 px-3 py-2 rounded-full shadow-lg border-2 border-white rotate-[12deg]">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-red-500 text-red-500 animate-pulse" />
        </div>

        {/* SELETOR DE IDIOMA (PORTUGUÊS 🇧🇷 / ENGLISH 🇺🇸) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pt-4 sm:pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 border border-amber-300 text-amber-950 font-cartoon text-xs sm:text-sm font-bold">
            <Globe className="w-4 h-4 text-amber-700" />
            <span>Idioma da Carta / Letter Language:</span>
          </div>

          <div className="inline-flex p-1 rounded-2xl bg-amber-200/90 border-2 border-amber-300 shadow-inner">
            <button
              onClick={() => handleLanguageChange('pt')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-cartoon font-black text-sm transition-all cursor-pointer ${
                lang === 'pt'
                  ? 'bg-emerald-500 text-white shadow-md scale-105 border border-emerald-300'
                  : 'text-amber-900 hover:bg-amber-100/60'
              }`}
            >
              <span className="text-base">🇧🇷</span>
              <span>Português</span>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-cartoon font-black text-sm transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-md scale-105 border border-blue-400'
                  : 'text-amber-900 hover:bg-amber-100/60'
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Cabeçalho da Carta */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-cartoon font-bold text-xs sm:text-base mb-2 shadow-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <span>{content.subBadge}</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-cartoon font-black text-amber-900 tracking-wide flex items-center justify-center gap-2 sm:gap-3">
            <span>{content.title}</span>
            <span className="text-red-500">❤️</span>
          </h2>
          <p className="text-xs sm:text-sm font-cartoon text-slate-600 mt-1">
            {content.origin}
          </p>
        </div>

        {/* Corpo da Carta Oficial (com scroll suave para telas menores) */}
        <div className="relative bg-amber-100/70 rounded-2xl p-5 sm:p-8 border-2 border-amber-300 shadow-inner max-h-[50vh] sm:max-h-[55vh] overflow-y-auto space-y-4 font-cartoon text-base sm:text-xl leading-relaxed text-slate-800">
          
          {/* Botão de Ouvir Carta (Text-to-Speech nativo) */}
          {typeof window !== 'undefined' && 'speechSynthesis' in window && (
            <div className="flex justify-end">
              <button
                onClick={handleToggleSpeech}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-cartoon text-xs sm:text-sm font-bold shadow-sm transition-all border cursor-pointer ${
                  isSpeaking
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-white/90 text-amber-900 border-amber-300 hover:bg-white'
                }`}
                title={isSpeaking ? content.stopAudioBtn : content.readAloudBtn}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>{content.stopAudioBtn}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>{content.readAloudBtn} 🔊</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="font-black text-blue-700 text-lg sm:text-2xl flex items-center gap-2">
            <span>💙</span>
            <span>{content.toWhom}</span>
          </div>

          <p className="font-bold text-amber-950 text-lg sm:text-2xl">
            {content.greeting}
          </p>

          <p>{content.p1}</p>

          <p>{content.p2}</p>

          <p>{content.p3}</p>

          <div className="pt-2 text-red-700 font-black text-lg sm:text-2xl">
            {content.hug}
          </div>

          <div className="pt-1 text-slate-700">
            {content.signOff}
          </div>

          <div className="font-black text-xl sm:text-3xl text-amber-900 flex items-center gap-2">
            <span>{content.signature}</span>
          </div>
        </div>

        {/* Rodapé com nota carinhosa e botão de voltar */}
        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-amber-800 font-cartoon font-bold text-xs sm:text-sm text-center sm:text-left">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{content.footerNote}</span>
          </div>

          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-cartoon font-black text-base sm:text-xl shadow-lg border-2 border-amber-600 transition flex items-center justify-center gap-2 btn-cartoon cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>{content.backBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
