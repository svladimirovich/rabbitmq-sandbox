FROM microsoft/dotnet

RUN mkdir /app
RUN mkdir /src
WORKDIR /src
ADD Consumer.csproj .
ADD Program.cs .
RUN dotnet build Consumer.csproj -c Release -o /app

WORKDIR /app
ENTRYPOINT ["dotnet", "Consumer.dll"]

