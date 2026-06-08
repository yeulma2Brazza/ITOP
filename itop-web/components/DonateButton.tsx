/* eslint-disable @next/next/no-img-element */

export default function DonateButton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 text-xs text-center">Vous aimez ITOP ? Soutenez-nous ♥</p>
        <form action="https://www.paypal.com/donate" method="post" target="_top">
          <input type="hidden" name="hosted_button_id" value="4PFJECDJET9KG" />
          <input
            type="image"
            src="https://www.paypalobjects.com/fr_CA/i/btn/btn_donate_SM.gif"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Faire un don avec PayPal"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
          <img
            alt=""
            src="https://www.paypal.com/fr_CA/i/scr/pixel.gif"
            width={1}
            height={1}
            style={{ display: 'none' }}
          />
        </form>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
      <div className="space-y-1">
        <p className="font-bold text-amber-900 text-base">Ce service vous a été utile ?</p>
        <p className="text-amber-700 text-sm leading-relaxed">
          ITOP est 100% gratuit et sans pub. Un don, même petit, nous aide à développer
          de nouvelles solutions pour vous.
        </p>
      </div>
      <form
        action="https://www.paypal.com/donate"
        method="post"
        target="_top"
        className="flex justify-center"
      >
        <input type="hidden" name="hosted_button_id" value="4PFJECDJET9KG" />
        <input
          type="image"
          src="https://www.paypalobjects.com/fr_CA/i/btn/btn_donate_LG.gif"
          name="submit"
          title="PayPal - The safer, easier way to pay online!"
          alt="Faire un don avec PayPal"
          className="cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-150"
        />
        <img
          alt=""
          src="https://www.paypal.com/fr_CA/i/scr/pixel.gif"
          width={1}
          height={1}
          style={{ display: 'none' }}
        />
      </form>
      <p className="text-xs text-amber-600">
        Paiement sécurisé via PayPal · Vous choisissez le montant
      </p>
    </div>
  )
}
