---
title: Account and login
icon: FaUser
order: 830
---

Most of Freemap works without an account. Logging in is needed to:

- save maps to your account and open them on another device – [My maps](#show=manual/my-maps),
- upload, rate and comment on photos – [Photos](#show=manual/photos),
- add your own devices for live tracking – [Live tracking](#show=manual/tracking),
- buy premium access and credits – [Premium and credits](#show=manual/premium),
- send a route to a Garmin device – [Maps in other apps and devices](#show=manual/devices).

When you are logged in, your map settings and custom maps are kept with your account rather than only in this browser.

## Logging in

Open :FaBars: **Main menu** → :FaSignInAlt: [Log in](#show=login) and choose a login provider: **Google**, **Facebook**, **Apple**, **Microsoft**, **OpenStreetMap**, **Garmin**, **Strava** or **GitHub**. Once you confirm the login with the provider, you are logged in to Freemap. Freemap has no password of its own.

Without a provider, log in **with an email code**: enter your **Email address**, press :FaEnvelope: **Send code**, and type the 6-digit code from the email (valid for 10 minutes) and press :FaSignInAlt: **Log in**. This logs in to the account whose confirmed email is that address, or creates a new account. Confirming an address in another account later joins the two.

![The Log in dialog with the login providers](./images/account-login.en.webp)

**Strava** is offered only on www.freemap.sk.

Logging in requires accepting the cookies consent – until then, the provider buttons are disabled and the dialog says so. Logging in also needs a connection.

The first login with a provider creates a new Freemap account. To log in to the same account with another provider as well, connect that provider in the **Login providers** section of the account instead of logging in with it separately.

## The Account dialog

Once logged in, the main menu shows :FaUser: [Account](#show=account) (<kbd>e</kbd> <kbd>a</kbd>) in place of **Log in**. The dialog has four sections:

- :FaShoppingBasket: **Purchases** – premium access, credits and **Manage payments**, described in [Premium and credits](#show=manual/premium).
- :FaAddressCard: **Personal information**
- :FaUserCircle: **Login providers**
- :FaKey: **App tokens**

An account given special permissions, such as photo moderation, also shows :FaUserShield: **My roles**, which lists them.

## Personal information

- **Profile picture** – :FaUpload: **Choose picture** picks an image of at most 5 MB, :FaTimes: **Remove** clears it.
- **Name** – required.
- **Email** and **About me** – optional.
- **Show on my public profile** – the confirmed email address and the connected OpenStreetMap, GitHub or Strava profiles, each shown only when ticked. Its words *my public profile* open your profile as others see it.

Press :FaCheck: **Save** to store the changes.

A new email address is not stored by **Save**: press :FaEnvelope: **Send code**, enter the code from the email sent to the new address and press :FaCheck: **Confirm**. An address not yet confirmed offers the same step, and a yellow strip at the top of the page links here. Only a confirmed address can be used to log in by email, shown on your public profile, and receives photo-comment notifications and the download links of [offline map exports](#show=offline-map-export).

Without any email address, the yellow strip asks for one; **Don’t remind me** in it, or removing your address here, stops that for good. The comment form of a photo you uploaded or commented on also says when new comments can't be emailed to you.

Below them, :FaHome: **Home position** is saved as soon as you set it: :FaMapMarkerAlt: **Set on the map** lets you click it on the map or find it by its address, :FaTimes: **Remove** clears it. The route planner and the events filter offer it as a place.

## Login providers

Several providers can lead to one Freemap account. Under **Connect**, press a provider you want to add; after you confirm its login, you can log in with it too. If that provider account already belongs to another Freemap account, the two accounts are joined into one.

The older of the two accounts is the one that stays, whichever you were logged in to, and links to the other one's profile lead to it. Its name stays unless it is only the generic *Freemap user*, both **About me** texts are kept, and the photos, maps, purchases and providers of both move into it. Devices logged in to the other account have to log in again.

Under **Disconnect**, press a connected provider to remove it, after a confirmation. The last remaining provider cannot be disconnected, unless the account has a confirmed email to log in with.

## App tokens

An app token lets another application or a script use Freemap as you – for example to show the premium zooms of the Outdoor map in Locus, or to work with your photos, maps or devices through the Freemap API. A token allows only what its permissions allow, and nothing with the account itself: it cannot be used to change your personal information, login providers or purchases, nor to create other tokens. The one exception is a user manager's token with the permission to change user accounts. :FaInfoCircle: **What are app tokens?** in the section shows how an app sends the token.

Press :FaPlus: **New token** and fill in:

- **Note** – what the token is for, so you recognize it in the list.
- **Permissions** – tick only what the app needs: viewing or changing photos, my maps or tracked devices, and the premium zooms of the Outdoor map, the terrain shadings and the Slovak and Czech aerial imagery. The map zooms work in apps other than JOSM only if you have premium access. A user manager also sees the user account permissions; a token with them must expire within 7 days of its creation.
- **Expires** – **Never**, in 7, 30, 90 or 365 days, or **On a date**; with a user account permission only in 7 days, or **On a date** within 7 days of the token's creation.

Press :FaCheck: **New token** below the form to create it. The token is shown only once: copy it with :FaClipboard: and store it – later it cannot be read again. Keep the token secret, like a password.

The list shows each token's note, permissions, creation date, expiry and when it was last used. :FaPencilAlt: **Edit token** changes the note, the permissions and the expiry; the token itself stays the same. :FaTrash: **Delete** revokes it at once, and apps using it stop working. If someone else may have got hold of a token, delete it and create a new one.

To use the Freemap maps in Locus Map or OruxMaps, you don't need to create a token by hand – the installation from :FaMobileAlt: **Maps for GPS devices** creates one when you are logged in, see [Maps in other apps and devices](#show=manual/devices).

## Logging out and deleting the account

:FaSignOutAlt: **Log out** at the bottom of the **Account** dialog logs you out on this device. It also removes from this browser the maps you made available offline and the map changes not yet sent; if there are such changes, you confirm first.

:FaEraser: **Delete account** removes the account after a confirmation, together with all your photos, photo comments and ratings, your maps and tracked devices. This cannot be undone.

Both need a connection.
