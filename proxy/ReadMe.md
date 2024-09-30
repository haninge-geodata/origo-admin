## Skapande av proxy token.
Detta steg kräver att Origo-Admin är installerat, samt att AUTH är påslaget för Origo-Admin

- Öppna Admin-gränssnittet och under Hantera API-nycklar välj "Lägg till"
  - Skapa sedan en API-nyckel med följande behörigheter.
    - GET:/mapinstances/mapinstances/:name/published/latest(.json)?
    - GET:/mapinstances/mapinstances/:id
    - GET:/proxy/proxy/resources
    - GET:/proxy/proxy/roles
    - 