## 개요

본 Usecase은 **방문자 관리를 위한 애플리케이션인 SMV의 기능을 사용자의 입장에서 설명하기 위한 사용 사례**이며 다양한 사용자를 대상으로 필요로 하는 기능 및 요구사항을 설명하고 있다.

### 목적

본 Usecase의 주요 목적은 다음과 같다

* SMV Project의 주요 기능을 정의
* 사용자와 개발자의 커뮤니케이션의 기초를 제공한다
* 사용자 화면 (UI) 요구 사항 정의를 위한 기초를 제공한다
* 테스트 케이스 작성을 위한 기초를 제공한다

### Actors

* 사용자
	* 리셉셔니스트
		* 출입 현장에서 방문자 및 에스코트 직원을 확인하고 임시 출입 카드를 발급 / 회수 한다
	* 에스코트 직원
		* 방문자를 사전에 등록 관리 할 수 있다
		* 출입 현장에서 방문자를 에스코트 한다
* 운영자
	* 관리자
		* 사용자의 최우선 권한을 가지고 있다
		* 직원 정보에 권한을 부여할 수 있다
		* 임시 출입 카드를 등록 및 관리 할 수 있다
	* 시스템 관리자
		* 애플리케이션 실행 시 발생하는 오류 및 장애에 대응한다
		* 데이터 및 코드에 직접적인 관여 할 수 있다
* SYSTEM
	* Cloud Appliction Runtime
		* Cloud App이 실행을 위한 Runtime 환경
	* Bluemix Portal
		* Cloud Appliction 배포, 실행 및 관리를 위한 PaaS 관리 포탈
	* Cloudant DB
		* 등록 사용자, 출입 카드 발급 정보, 방문자 정보, 방문 기록 데이터와 같은 애플리케이션이 필요로 하는 정보를 보관하는 NoSQL Database
	* LDAP Server
		* 사용자 정보 조회 및 인증을 위한 Directory Service 서버

## Usecase Name Format

* SMV-000-000-XXXX

	| Key   | 설명 |
	|-------| :-- |
	| SMV   | 프로젝트 코드 |
	| UCS   | Usecase 코드 |
	| 000   | 대분류 번호 |
	| 000   | 소분류 번호 |
	| XXXX  | Usecase 이름 |


## Usecases

* [SMV-UCS-000-001-사용자 로그인](usecases/SMV-UCS-000-001-사용자_로그인.md)
* [SMV-UCS-000-002-사용자 로그아웃](usecases/SMV-UCS-000-002-사용자_로그아웃.md)
* [SMV-UCS-100-001-방문 예정 정보 추가](usecases/SMV-UCS-100-001-방문_예정_정보_추가.md)
* [SMV-UCS-100-002-방문 예정 정보 조회](usecases/SMV-UCS-100-002-방문_예정_정보_조회.md)
* [SMV-UCS-100-003-방문 예정 정보 변경](usecases/SMV-UCS-100-003-방문_예정_정보_변경.md)
* [SMV-UCS-100-004-방문 예정 정보 취소](usecases/SMV-UCS-100-004-방문_예정_정보_취소.md)
* [SMV-UCS-101-001-담당자 방문 예정 정보 조회](usecases/SMV-UCS-101-001-담당자_방문_예정_정보_조회.md)
* [SMV-UCS-101-002-담당자 방문 예정 정보 추가](usecases/SMV-UCS-101-002-담당자_방문_예정_정보_추가.md)
* [SMV-UCS-101-003-담당자 방문 예정 정보 변경](usecases/SMV-UCS-101-003-담당자_방문_예정_정보_변경.md)
* [SMV-UCS-101-004-담당자 방문 예정 정보 취소](usecases/SMV-UCS-101-004-담당자_방문_예정_정보_취소.md)
* [SMV-UCS-102-001-현장 방문 등록](usecases/SMV-UCS-102-001-현장_방문_등록.md)
* [SMV-UCS-102-002-현장 방문자 확인](usecases/SMV-UCS-102-002-현장_방문자_확인.md)
* [SMV-UCS-103-001-방문 내역 조회](usecases/SMV-UCS-103-001-방문_내역_조회.md)
* [SMV-UCS-200-001-방문자 임시 출입카드 발급](usecases/SMV-UCS-200-001-방문자_임시_출입카드_발급.md)
* [SMV-UCS-200-002-방문자 임시 출입카드 회수](usecases/SMV-UCS-200-002-방문자_임시_출입카드_회수.md)
* [SMV-UCS-300-001-방문자 정보 확인](usecases/SMV-UCS-300-001-방문자_정보_확인.md)
* [SMV-UCS-300-002-방문자 보안 서약 및 정보 제공 동의](usecases/SMV-UCS-300-002-방문자_보안_서약_및_정보_제공_동의.md)
* [SMV-UCS-400-001-사용자 조회](usecases/SMV-UCS-400-001-사용자_조회.md)
* [SMV-UCS-400-002-사용자 권한 변경](usecases/SMV-UCS-400-002-사용자_권한_변경.md)
* [SMV-UCS-402-001-임시 출입카드 등록](usecases/SMV-UCS-402-001-임시_출입카드_등록.md)
* [SMV-UCS-402-002-임시 출입카드 조회](usecases/SMV-UCS-402-002-임시_출입카드_조회.md)
* [SMV-UCS-402-003-임시 출입카드 정보 변경](usecases/SMV-UCS-402-003-임시_출입카드_정보_변경.md)
* [SMV-UCS-402-004-임시 출입카드 삭제](usecases/SMV-UCS-402-004-임시_출입카드_삭제.md)
* [SMV-UCS-403-001-보안 서약 및 정보 제공 동의 템플릿 조회](usecases/SMV-UCS-403-001-보안_서약_및_정보_제공_동의_템플릿_조회.md)
* [SMV-UCS-403-002-보안 서약 및 정보 제공 동의 템플릿 변경](usecases/SMV-UCS-403-002-보안_서약_및_정보_제공_동의_템플릿_변경.md)
