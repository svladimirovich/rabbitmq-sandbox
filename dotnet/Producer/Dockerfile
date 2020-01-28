FROM microsoft/dotnet

RUN mkdir /app
RUN mkdir /src
WORKDIR /src
COPY . /src/.
RUN dotnet build Producer.csproj -c Release -o /app

WORKDIR /app
ENTRYPOINT ["dotnet", "Producer.dll"]

