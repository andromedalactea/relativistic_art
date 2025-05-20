import { useState } from 'react';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@radix-ui/react-dialog';
import Image from 'next/image';

type Language = 'en' | 'es';

interface PhysicsEffect {
  id: string;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  formula: string;
  explanation: {
    en: string;
    es: string;
  };
  visualAid?: string;
}

const physicsEffects: PhysicsEffect[] = [
  {
    id: 'length-contraction',
    title: {
      en: 'Length Contraction',
      es: 'Contracción de Longitud'
    },
    description: {
      en: 'Objects appear shorter in the direction of motion',
      es: 'Los objetos parecen más cortos en la dirección del movimiento'
    },
    formula: 'L = L₀√(1 - v²/c²)',
    explanation: {
      en: `When an object moves at high speeds, it appears shorter in the direction of motion. This is because space itself contracts in the direction of motion. The faster the object moves, the more it contracts. This effect becomes noticeable only at speeds close to the speed of light.

In our visualization, you can see how the image appears to compress horizontally when moving at high speeds. This is a direct result of length contraction.`,
      es: `Cuando un objeto se mueve a altas velocidades, parece más corto en la dirección del movimiento. Esto ocurre porque el espacio mismo se contrae en la dirección del movimiento. Cuanto más rápido se mueve el objeto, más se contrae. Este efecto solo se vuelve notable a velocidades cercanas a la velocidad de la luz.

En nuestra visualización, puedes ver cómo la imagen parece comprimirse horizontalmente cuando se mueve a altas velocidades. Esto es un resultado directo de la contracción de longitud.`
    },
    visualAid: '/physics-aids/length-contraction.svg'
  },
  {
    id: 'doppler-effect',
    title: {
      en: 'Relativistic Doppler Effect',
      es: 'Efecto Doppler Relativista'
    },
    description: {
      en: 'Colors shift and brightness changes due to relative motion',
      es: 'Los colores cambian y el brillo se modifica debido al movimiento relativo'
    },
    formula: 'f = f₀√((1 + v/c)/(1 - v/c))',
    explanation: {
      en: `The relativistic Doppler effect causes light to change color and intensity when the source is moving relative to the observer. As an object moves toward you, its light appears bluer and brighter. When it moves away, the light appears redder and dimmer.

In our visualization, you can see how the colors shift and the brightness changes as the image moves at different speeds. This is similar to how a police siren sounds different as it approaches and moves away from you, but with light instead of sound.`,
      es: `El efecto Doppler relativista hace que la luz cambie de color e intensidad cuando la fuente se mueve en relación con el observador. Cuando un objeto se acerca a ti, su luz parece más azulada y brillante. Cuando se aleja, la luz parece más rojiza y tenue.

En nuestra visualización, puedes ver cómo los colores cambian y el brillo se modifica cuando la imagen se mueve a diferentes velocidades. Esto es similar a cómo una sirena de policía suena diferente cuando se acerca y se aleja de ti, pero con luz en lugar de sonido.`
    },
    visualAid: '/physics-aids/doppler-effect.svg'
  },
  {
    id: 'time-dilation',
    title: {
      en: 'Time Dilation',
      es: 'Dilatación del Tiempo'
    },
    description: {
      en: 'Time appears to slow down for moving objects',
      es: 'El tiempo parece ralentizarse para los objetos en movimiento'
    },
    formula: 't = t₀/√(1 - v²/c²)',
    explanation: {
      en: `Time dilation means that time appears to pass more slowly for objects moving at high speeds. This is why astronauts on the International Space Station age slightly slower than people on Earth.

In our visualization, this effect is represented by how the image's properties change over time. The faster the image moves, the more pronounced these changes become.`,
      es: `La dilatación del tiempo significa que el tiempo parece pasar más lentamente para los objetos que se mueven a altas velocidades. Por eso los astronautas en la Estación Espacial Internacional envejecen ligeramente más lento que las personas en la Tierra.

En nuestra visualización, este efecto se representa por cómo las propiedades de la imagen cambian con el tiempo. Cuanto más rápido se mueve la imagen, más pronunciados se vuelven estos cambios.`
    },
    visualAid: '/physics-aids/time-dilation.svg'
  }
];

export const PhysicsExplanationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [selectedEffect, setSelectedEffect] = useState<string>(physicsEffects[0].id);

  const currentEffect = physicsEffects.find(effect => effect.id === selectedEffect);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-lg font-semibold backdrop-blur-sm flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {language === 'en' ? 'Physics Explanation' : 'Explicación Física'}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2">
          <div className="bg-black border border-white/10 rounded-xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            <DialogTitle className="sr-only">
              {language === 'en' ? 'Physics Behind the Effects' : 'Física Detrás de los Efectos'}
            </DialogTitle>
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                {language === 'en' ? 'Physics Behind the Effects' : 'Física Detrás de los Efectos'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                  className="group relative px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">
                    {language === 'en' ? 'Español' : 'English'}
                  </span>
                </button>
                <DialogClose asChild>
                  <button
                    className="group relative px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {language === 'en' ? 'Close' : 'Cerrar'}
                    </span>
                  </button>
                </DialogClose>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar with effect selection */}
              <div className="w-80 border-r border-white/10 p-4 overflow-y-auto">
                {physicsEffects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setSelectedEffect(effect.id)}
                    className={`w-full text-left p-4 rounded-lg mb-3 transition-colors ${
                      selectedEffect === effect.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <h3 className="text-xl font-medium">{effect.title[language]}</h3>
                    <p className="text-base mt-2">{effect.description[language]}</p>
                  </button>
                ))}
              </div>

              {/* Main content area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentEffect && (
                  <div className="space-y-8">
                    <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {currentEffect.title[language]}
                      </h3>
                      <div className="text-gray-300 space-y-6">
                        <p className="text-lg leading-relaxed">{currentEffect.explanation[language]}</p>
                        <div className="bg-black/50 p-6 rounded-lg font-mono text-center text-xl">
                          {currentEffect.formula}
                        </div>
                      </div>
                    </div>

                    {currentEffect.visualAid && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <Image
                          src={currentEffect.visualAid}
                          alt={currentEffect.title[language]}
                          width={800}
                          height={600}
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 